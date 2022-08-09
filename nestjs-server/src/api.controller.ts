import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { SearchParameters } from './api.types';

@Controller('api')
export class ApiController {
  constructor(private readonly db: DatabaseService) {}

  @Get('profiles')
  async getProfileList() {
    const profiles = await this.db.getProfiles();
    return profiles;
  }

  @Get('devices')
  async getDevices() {
    // @TODO pagination
    const devices = await this.db.getDevices();
    return devices;
  }

  @Get('events')
  async getEvents(@Query() search: SearchParameters) {
    // @TODO pagination
    const events = await this.db.getEvents(search);
    return events;
  }
}
