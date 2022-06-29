import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex from 'knex';
import * as crypto from 'crypto';
import { MigrationSource } from '../libs/migration-source';

export interface Profile {
  id: string;
  fingerprint: string;
  name: string;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  localIp: string;
}

export interface RawEvent {
  timestamp: string;
  domain: string;
  root: string;
  tracker: string;
  encrypted: boolean;
  protocol: string;
  clientIp: string;
  client: string;
  device: Device;
  status: string;
  reasons: string[];
}

export interface EventModel {
  timestamp: number; // unix timestamp
  domain: string;
  root: string;
  tracker: string;
  encrypted: boolean;
  protocol: string;
  clientIp: string;
  client: string;
  deviceId: string;
  status: string;
  reasons: string;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private type: string;
  // @TODO make this private
  connection: any;

  constructor(private readonly configService: ConfigService) {
    const client = this.configService.get<string>('DATABASE_CLIENT');
    const params = {
      client,
      ...(client === 'sqlite3' && {
        connection: {
          filename: this.configService.get<string>('SQLITE_FILE'),
          useNullAsDefault: true,
        },
      }),
      ...(client === 'mysql' && {
        connection: {
          host: this.configService.get<string>('MARIADB_HOST'),
          port: this.configService.get<string>('MARIADB_PORT'),
          database: this.configService.get<string>('MARIADB_DATABASE'),
          user: this.configService.get<string>('MARIADB_USER'),
          password: this.configService.get<string>('MARIADB_PASSWORD'),
        },
      }),
    };
    console.log('... connection params', params);
    this.connection = knex(params);
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.destroy();
    }
  }

  async migrateLatest(): Promise<void> {
    await this.connection.migrate.latest({
      migrationSource: new MigrationSource(),
    });
  }

  async insertProfile(profile: Profile): Promise<string> {
    await this.connection('profiles').insert(profile);
    return profile.id;
  }

  async insertDevice(device: Device): Promise<string> {
    await this.connection('devices').insert(device).onConflict().ignore();
    return device.id;
  }

  async insertEvent(event: RawEvent): Promise<string> {
    const id = crypto
      .createHash('md5')
      .update(
        [event.timestamp, event.domain, event.clientIp, event.device?.name]
          .filter(Boolean)
          .join(''),
      )
      .digest('hex');
    const timestamp = new Date(event.timestamp).valueOf() / 1000;
    await this.connection('events').insert({
      id,
      timestamp,
      domain: event.domain,
      root: event.root,
      tracker: event.tracker,
      encrypted: event.encrypted,
      protocol: event.protocol,
      clientIp: event.clientIp,
      client: event.client,
      deviceId: event.device.id,
      status: event.status,
      reasons: (event.reasons || []).join(', '),
    });
    await this.insertDevice(event.device);
    return id;
  }

  async getDevices(): Promise<Device[]> {
    return this.connection('devices').select();
  }

  async getProfiles(): Promise<Profile[]> {
    return this.connection('profiles').select();
  }
}
