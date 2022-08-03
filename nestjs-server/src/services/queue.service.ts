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
  private messageHandler: any;
  private handleCount = 0;

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
    this.amqpChannel.prefetch(1);

    this.poll();
    this.reportQueueCount();
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
    this.messageHandler = handler;
  }

  private async getQueueCount(): Promise<number | void> {
    if (this.amqpChannel?.checkQueue) {
      const result = await this.amqpChannel.checkQueue(this.incomingLogQueue);
      return result?.messageCount;
    }
  }

  private async reportQueueCount() {
    const count = await this.getQueueCount();
    if (count || count === 0) {
      console.log('Queue count:', count);
    }
    await pause(5000);
    this.reportQueueCount();
  }

  private async poll() {
    if (this.amqpChannel?.consume && this.messageHandler) {
      try {
        this.amqpChannel.consume(
          this.incomingLogQueue,
          async (message: any) => {
            await this.messageHandler(JSON.parse(message.content.toString()));
            if (this.handleCount++ > 500) {
              await pause(2000);
              this.handleCount = 0;
            }
            this.amqpChannel.ack(message);
          },
          { noAck: false },
        );
      } catch (err) {
        console.error('error on message handling', err);
      }
    }

    await pause(100);
    return this.poll();
  }
}
