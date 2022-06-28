import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyController } from './proxy.controller';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { DatabaseService } from './services/database.service';
import { NextDnsApiService } from './services/next-dns-api.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ProxyController],
  providers: [QueueService, DatabaseService, NextDnsApiService],
})
export class AppModule {}
