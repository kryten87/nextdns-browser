import { Injectable } from '@nestjs/common';
import { MigrationSource } from '../libs/migration-source';
import * as crypto from 'crypto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { SearchParameters } from '../api.types';
import knex from 'knex';

const PAGE_SIZE = 20;

export interface Profile {
  profileId: string;
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
    return profile.profileId;
  }

  async setLastEventId(profileId: string, lastEventId: string): Promise<void> {
    await this.knex
      .table('profiles')
      .update({ lastEventId })
      .where('profileId', '=', profileId);
  }

  async insertDevice(device: Device): Promise<string> {
    const values = { ...device, deviceId: device.id };
    delete values.id;
    await this.knex.table('devices').insert(values).onConflict().ignore();
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
        eventId: null,
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

  private buildQuery(query: any, params: SearchParameters): any {
    let result = query;
    const { profileId, deviceId, status, search, cursor } = params;
    result = result.where('profileId', '=', profileId);

    if (deviceId) {
      result = result.where((builder) => {
        builder
          .where('deviceId', '=', deviceId)
          .orWhere('localIp', '=', deviceId);
      });
    }

    if (status) {
      result = result.where('status', '=', status);
    }

    if (search) {
      result = result.where((builder) => {
        builder
          .whereILike('domain', `%${search}%`)
          .orWhereILike('root', `%${search}%`)
          .orWhereILike('name', `%${search}%`)
          .orWhereILike('reasons', `%${search}%`);
      });
    }

    if (cursor) {
      result = result.where('eventId', '<', cursor);
    }

    return result;
  }

  async getEvents(params: SearchParameters) {
    let baseQuery = this.knex
      .table('events')
      .join('devices', 'events.deviceId', '=', 'devices.deviceId')
      .orderBy('timestamp', 'DESC')
      .limit(PAGE_SIZE);
    baseQuery = this.buildQuery(baseQuery, params);
    return baseQuery;
  }

  async getEventCount(params: SearchParameters) {
    const results = await this.buildQuery(
      this.knex
        .table('events')
        .join('devices', 'events.deviceId', '=', 'devices.deviceId')
        .count('eventId', { as: 'count' }),
      { ...params, cursor: undefined },
    );
    return results[0].count;
  }
}
