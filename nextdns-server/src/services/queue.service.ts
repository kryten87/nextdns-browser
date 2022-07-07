import { ConfigService } from '@nestjs/config';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import * as amqp from 'amqplib';

const pause = async (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private rabbitUrl: string;
  private incomingLogQueue: string;
  private amqpConnection: amqp.Connection;
  private amqpChannel: any;

  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject('AMQP_LIB') private amqpLib,
  ) {
    this.rabbitUrl = this.config.get<string>('RABBIT_URL');
    this.incomingLogQueue = this.config.get<string>(
      'RABBIT_INCOMING_LOG_QUEUE',
    );
    this.amqpLib = this.amqpLib || amqp;
  }

  async onModuleInit() {
    this.amqpConnection = await this.amqpLib.connect(this.rabbitUrl);
    this.amqpChannel = await this.amqpConnection.createChannel();
    await this.amqpChannel.assertQueue(this.incomingLogQueue);
  }

  async onModuleDestroy() {
    this.amqpConnection.close();
  }

  sendToLogQueue(profileId: string, message: any) {
    const data = JSON.parse(message.data);
    data.profileId = profileId;
    const fullMessage = { ...message, data };
    this.amqpChannel.sendToQueue(
      this.incomingLogQueue,
      Buffer.from(JSON.stringify(fullMessage)),
    );
  }

  async onLogQueueMessage(handler: any) {
    try {
      this.amqpChannel.consume(this.incomingLogQueue, async (message: any) => {
        await handler(JSON.parse(message.content.toString()));
        this.amqpChannel.ack(message);
      });
    } catch (err) {
      await pause(10);
      return this.onLogQueueMessage(handler);
    }
  }
}