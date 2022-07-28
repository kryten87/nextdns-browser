import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './services/database.service';
import { Module } from '@nestjs/common';
import { NextDnsApiService } from './services/next-dns-api.service';
import { QueueService } from './services/queue.service';
import { StartUpService } from './services/start-up.service';
import { ApiController } from './api.controller';
import { KnexModule } from 'nestjs-knex';

@Module({
  imports: [
    ConfigModule.forRoot(),

    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = configService.get<string>('DATABASE_CLIENT');
        return {
          config: {
            client,

            ...(client === 'sqlite3' && {
              useNullAsDefault: true,
              connection: {
                filename: configService.get<string>('SQLITE_FILE'),
              },
            }),

            ...(client === 'mysql2' && {
              connection: {
                host: configService.get<string>('MARIADB_HOST'),
                port: configService.get<string>('MARIADB_PORT'),
                database: configService.get<string>('MARIADB_DATABASE'),
                user: configService.get<string>('MARIADB_USER'),
                password: configService.get<string>('MARIADB_PASSWORD'),
              },
            }),

          },
        };
      },
    }),
  ],
  controllers: [AppController, ApiController],
  providers: [QueueService, DatabaseService, NextDnsApiService, StartUpService],
})
export class AppModule {}
