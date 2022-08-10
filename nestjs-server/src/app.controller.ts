import { Controller, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { NextDnsApiService } from './services/next-dns-api.service';
import { QueueService } from './services/queue.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController implements OnModuleInit {
  private eventSources: any[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly db: DatabaseService,
    private readonly api: NextDnsApiService,
  ) {
    if (!this.configService.get<boolean>('DISABLE_INCOMING_MESSAGES')) {
      this.queueService.onLogQueueMessage(this.queueHandler);
    } else {
      // @TODO add NestJS compliant logging
      console.log('queued message handling disabled');
    }
  }

  async onModuleInit() {
    if (!this.configService.get<boolean>('DISABLE_INCOMING_MESSAGES')) {
      const profiles = await this.db.getProfiles();
      profiles.forEach((profile) => {
        this.eventSources.push(
          this.api.initializeEventSource(
            profile,
            this.createStreamHandler(profile.profileId),
          ),
        );
      });
    } else {
      console.log('incoming messages functionality disabled');
    }
  }

  createStreamHandler = (profile: string) => {
    return async (message: any): Promise<void> => {
      this.queueService.sendToLogQueue(profile, message);
    };
  };

  queueHandler = async (message) => {
    await this.db.insertEvent(message.data);
    if (message.data.profileId && message.lastEventId) {
      await this.db.setLastEventId(message.data.profileId, message.lastEventId);
    }
  };
}
