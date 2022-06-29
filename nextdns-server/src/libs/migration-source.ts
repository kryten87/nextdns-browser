import { Knex } from 'knex';

export class MigrationSource {
  getMigrations(): Promise<string[]> {
    return Promise.resolve(['20220627211021-initial-table-creation']);
  }

  getMigrationName(migration: string): string {
    return migration;
  }

  getMigration(migration: string): any {
    switch (migration) {
      case '20220627211021-initial-table-creation':
        return {
          async up(knex: Knex): Promise<void> {
            await knex.schema.createTable('profiles', (table) => {
              table.string('id').primary();
              table.string('fingerprint').nullable();
              table.string('name').notNullable();
            });

            await knex.schema.createTable('devices', (table) => {
              table.string('id').primary();
              table.string('name').notNullable().index();
              table.string('model').nullable();
              table.string('localIp').nullable();
            });

            await knex.schema.createTable('events', (table) => {
              table.string('id').primary();
              table.string('profileId').notNullable().index();
              table.float('timestamp').notNullable().index();
              table.string('domain').nullable();
              table.string('root').nullable();
              table.string('tracker').nullable();
              table.boolean('encrypted').nullable();
              table.string('protocol').nullable();
              table.string('clientIp').nullable();
              table.string('client').nullable();
              table.string('deviceId').notNullable().index();
              table.string('status').notNullable().index();
              table.text('reasons').nullable();
            });
          },

          async down(knex: Knex): Promise<void> {
            await knex.schema.dropTable('events');
            await knex.schema.dropTable('devices');
            await knex.schema.dropTable('profiles');
          },
        };
    }
  }
}
