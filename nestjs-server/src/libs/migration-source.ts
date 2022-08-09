import { Knex } from 'knex';

export class MigrationSource {
  getMigrations(): Promise<string[]> {
    return Promise.resolve([
      '20220627211021-initial-table-creation',
      '20220702074000-add-profile-role',
      '20220707093800-add-profile-lasteventid',
      '20220805101700-add-event-autoincrement-key',
      '20220809122200-id-column-changes',
      '20220809123600-index-device-localIp',
    ]);
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
              table.double('timestamp').notNullable().index();
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

      case '20220702074000-add-profile-role':
        return {
          async up(knex: Knex): Promise<void> {
            await knex.schema.alterTable('profiles', (table) => {
              table.string('role');
            });
          },

          async down(knex: Knex): Promise<void> {
            await knex.schema.alterTable('profiles', (table) => {
              table.dropColumn('role');
            });
          },
        };

      case '20220707093800-add-profile-lasteventid':
        return {
          async up(knex: Knex): Promise<void> {
            await knex.schema.alterTable('profiles', (table) => {
              table.string('lastEventId').nullable();
            });
          },

          async down(knex: Knex): Promise<void> {
            await knex.schema.alterTable('profiles', (table) => {
              table.dropColumn('lastEventId');
            });
          },
        };

      case '20220805101700-add-event-autoincrement-key':
        return {
          async up(knex: Knex): Promise<void> {
            const tempTableName = `temp_${Date.now()}`;

            // create temp table for events
            await knex.schema.createTable(tempTableName, (table) => {
              table.increments('id');
              table.string('hash').notNullable().unique();
              table.string('profileId').notNullable().index();
              table.double('timestamp').notNullable().index();
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

            // copy events data in ordered fashion
            await knex.raw(`
              INSERT INTO ${tempTableName}
              SELECT
                NULL AS id,
                id AS hash,
                profileId,
                timestamp,
                domain,
                root,
                tracker,
                encrypted,
                protocol,
                clientIp,
                client,
                deviceId,
                status,
                reasons
              FROM events
              ORDER BY timestamp ASC;
            `);

            // remove events table
            await knex.schema.dropTable('events');

            // rename temp table to events table
            await knex.schema.renameTable(tempTableName, 'events');
          },

          async down(knex: Knex): Promise<void> {
            // alter table to remove id column
            // rename hash column as id column
            // make id column primary
          },
        };

      case '20220809122200-id-column-changes':
        return {
          async up(knex: Knex): Promise<void> {
            await knex.schema.alterTable('devices', (table) => {
              table.renameColumn('id', 'deviceId');
            });
            await knex.schema.alterTable('events', (table) => {
              table.renameColumn('id', 'eventId');
            });
            await knex.schema.alterTable('profiles', (table) => {
              table.renameColumn('id', 'profileId');
            });
          },

          async down(knex: Knex): Promise<void> {
            await knex.schema.alterTable('devices', (table) => {
              table.renameColumn('deviceId', 'id');
            });
            await knex.schema.alterTable('events', (table) => {
              table.renameColumn('eventId', 'id');
            });
            await knex.schema.alterTable('profiles', (table) => {
              table.renameColumn('profileId', 'id');
            });
          },
        };

      case '20220809123600-index-device-localIp':
        return {
          async up(knex: Knex): Promise<void> {
            await knex.schema.alterTable('devices', (table) => {
              table.index('localIp');
            });
          },

          async down(knex: Knex): Promise<void> {
            await knex.schema.alterTable('devices', (table) => {
              table.dropIndex('localIp');
            });
          },
        };
    }
  }
}
