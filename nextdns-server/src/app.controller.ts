import { Controller, OnModuleInit } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import { DatabaseService } from './services/database.service';
import { NextDnsApiService } from './services/next-dns-api.service';

@Controller()
export class AppController implements OnModuleInit {
  private eventSources: any[] = [];

  constructor(
    private readonly queueService: QueueService,
    private readonly db: DatabaseService,
    private readonly api: NextDnsApiService,
  ) {
    this.queueService.onLogQueueMessage(this.queueHandler);
  }

  async onModuleInit() {
    const profiles = await this.db.getProfiles();
    profiles.forEach((profile) => {
      this.eventSources.push(
        this.api.initializeEventSource(
          profile,
          this.createStreamHandler(profile.id),
        ),
      );
    });
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
