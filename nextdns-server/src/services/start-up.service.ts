import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NextDnsApiService } from './next-dns-api.service';

@Injectable()
export class StartUpService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly nextDnsApiService: NextDnsApiService,
  ) {}

  async onModuleInit() {
    // perform the app startup tasks
    await Promise.all([this.updateProfiles()]);
  }

  async updateProfiles(): Promise<void> {
    const profiles = await this.nextDnsApiService.getProfiles();
    await Promise.all(
      profiles.map((profile) => this.databaseService.insertProfile(profile)),
    );
  }
}
