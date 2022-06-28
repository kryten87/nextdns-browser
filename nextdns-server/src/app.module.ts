import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyController } from './proxy.controller';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { DatabaseService } from './database.service';
import { NextDnsApiService } from './next-dns-api.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ProxyController],
  providers: [AppService, QueueService, DatabaseService, NextDnsApiService],
})
export class AppModule {}
