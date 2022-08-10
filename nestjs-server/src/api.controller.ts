import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { SearchParameters, SearchResponse } from './api.types';
// @TODO reorganize types
import { Profile, Device } from './services/database.service';

@Controller('api')
export class ApiController {
  constructor(private readonly db: DatabaseService) {}

  @Get('profiles')
  async getProfileList(): Promise<Profile[]> {
    const profiles = await this.db.getProfiles();
    return profiles;
  }

  @Get('devices')
  async getDevices(): Promise<Device[]> {
    // @TODO pagination
    const devices = await this.db.getDevices();
    return devices;
  }

  @Get('events')
  async getEvents(@Query() search: SearchParameters): Promise<SearchResponse> {
    // @TODO pagination
    const events = await this.db.getEvents(search);
    const cursor = events.length ? events[events.length - 1].eventId : null;
    return { cursor, events };
  }
}
