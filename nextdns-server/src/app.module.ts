import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './services/database.service';
import { Module } from '@nestjs/common';
import { NextDnsApiService } from './services/next-dns-api.service';
import { QueueService } from './services/queue.service';
import { StartUpService } from './services/start-up.service';
import { ApiController } from './api.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ApiController],
  providers: [QueueService, DatabaseService, NextDnsApiService, StartUpService],
})
export class AppModule {}
