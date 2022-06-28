import { Controller } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import * as EventSource from 'eventsource';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';

const values = [];
@Controller()
export class AppController {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private eventSource: any;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('NEXTDNS_API_KEY');
    this.baseUrl = this.configService.get<string>('NEXTDNS_BASE_URL');
    this.eventSource = new EventSource(
      `${this.baseUrl}profiles/963ede/logs/stream`,
      {
        headers: { 'X-Api-Key': this.apiKey },
      },
    );
    this.eventSource.onmessage = this.streamHandler;

    this.queueService.onLogQueueMessage(this.queueHandler);
  }

  streamHandler = (message) => {
    this.queueService.sendToLogQueue(message);
  };

  queueHandler = async (message) => {
    const data = JSON.parse(JSON.parse(message)?.data || '{}');
    console.log('..... queue handler', data);
    values.push(data);
    if (values.length === 10) {
      writeFileSync('./exampledata.json', JSON.stringify(values, null, 2));
    }
  };
}
