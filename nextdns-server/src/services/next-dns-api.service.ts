import { ConfigService } from '@nestjs/config';
import { Injectable, Inject, Optional } from '@nestjs/common';
import axios from 'axios';
import { Profile } from './database.service';
import * as EventSource from 'eventsource';

@Injectable()
export class NextDnsApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject('AXIOS_LIB') private axiosLib: any,
  ) {
    if (!axiosLib) {
      this.axiosLib = axios;
    }
    this.apiKey = this.configService.get<string>('NEXTDNS_API_KEY');
    this.baseUrl = this.configService.get<string>('NEXTDNS_BASE_URL');
  }

  async getProfiles(): Promise<any[]> {
    return this.getProfilesUsingCursor();
  }

  private async getProfilesUsingCursor(cursor?: string): Promise<any[]> {
    const url = [`${this.baseUrl}/profiles`, cursor && `cursor=${cursor}`]
      .filter(Boolean)
      .join('?');
    const response = await this.axiosLib({
      method: 'GET',
      url,
      headers: { 'X-Api-Key': this.apiKey },
    });
    const result = response.data;
    const nextCursor = result?.meta?.pagination?.cursor;
    if (nextCursor) {
      return [
        ...result.data,
        ...(await this.getProfilesUsingCursor(nextCursor)),
      ];
    }
    return result.data;
  }

  initializeEventSource(profile: Profile, handler: any): any {
    const eventSource = new EventSource(
      `${this.baseUrl}profiles/${profile.id}/logs/stream`,
      {
        headers: { 'X-Api-Key': this.apiKey },
      },
    );
    eventSource.onmessage = handler;
    return eventSource;
  }
}
