import { Injectable } from '@nestjs/common';
import { MigrationSource } from '../libs/migration-source';
import * as crypto from 'crypto';
import { InjectKnex, Knex } from 'nestjs-knex';

export interface Profile {
  id: string;
  fingerprint: string;
  name: string;
  role?: string;
  lastEventId?: string;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  localIp: string;
}

interface Reason {
  id: string;
  name: string;
}

export interface RawEvent {
  timestamp: string;
  profileId: string;
  domain: string;
  root: string;
  tracker: string;
  encrypted: boolean;
  protocol: string;
  clientIp: string;
  client: string;
  device: Device;
  status: string;
  reasons: Reason[];
}

export interface EventModel {
  timestamp: number; // unix timestamp
  profileId: string;
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
export class DatabaseService {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async migrateLatest(): Promise<void> {
    await this.knex.migrate.latest({
      migrationSource: new MigrationSource(),
    });
  }

  async insertProfile(profile: Profile): Promise<string> {
    await this.knex.table('profiles').insert(profile).onConflict().ignore();
    return profile.id;
  }

  async setLastEventId(profileId: string, lastEventId: string): Promise<void> {
    await this.knex
      .table('profiles')
      .update({ lastEventId })
      .where('id', '=', profileId);
  }

  async insertDevice(device: Device): Promise<string> {
    await this.knex.table('devices').insert(device).onConflict().ignore();
    return device.id;
  }

  async insertEvent(event: RawEvent): Promise<string> {
    const hash = crypto
      .createHash('md5')
      .update(
        [event.timestamp, event.domain, event.clientIp, event.device?.name]
          .filter(Boolean)
          .join(''),
      )
      .digest('hex');
    const timestamp = new Date(event.timestamp).valueOf() / 1000;
    await this.knex
      .table('events')
      .insert({
        id: null,
        hash,
        timestamp,
        profileId: event.profileId,
        domain: event.domain,
        root: event.root,
        tracker: event.tracker,
        encrypted: event.encrypted,
        protocol: event.protocol,
        clientIp: event.clientIp,
        client: event.client,
        deviceId: event.device.id,
        status: event.status,
        reasons: event.reasons
          .map((reason) => `${reason.name} (${reason.id})`)
          .join(', '),
      })
      .onConflict()
      .ignore();
    await this.insertDevice(event.device);
    return hash;
  }

  async getDevices(): Promise<Device[]> {
    return this.knex.table('devices').select();
  }

  async getProfiles(): Promise<Profile[]> {
    return this.knex.table('profiles').select();
  }
}
