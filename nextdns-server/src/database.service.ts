import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex from 'knex';

@Injectable()
export class DatabaseService {
  private type: string;
  private connection: any;

  constructor(private readonly configService: ConfigService) {
    const client = this.configService.get<string>('DATABASE_CLIENT');
    const params = {
      client,
      ...(client === 'sqlite3' && {
        filename: this.configService.get<string>('SQLITE_FILE'),
        useNullAsDefault: true,
      }),
      ...(client === 'mysql' && {
        host: this.configService.get<string>('MARIADB_HOST'),
        port: this.configService.get<string>('MARIADB_PORT'),
        database: this.configService.get<string>('MARIADB_DATABASE'),
        user: this.configService.get<string>('MARIADB_USER'),
        password: this.configService.get<string>('MARIADB_PASSWORD'),
      }),
    };
    this.connection = knex(params);
  }


}
