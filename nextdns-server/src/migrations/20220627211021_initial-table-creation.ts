import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('events');
  await knex.schema.dropTable('devices');
  await knex.schema.dropTable('profiles');
}
