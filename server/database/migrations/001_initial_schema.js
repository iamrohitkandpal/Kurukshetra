/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('email').notNullable();
      table.string('password').notNullable();
      table.string('role').defaultTo('user');
      table.string('api_key');
      table.text('personal_data');
      table.string('mfa_secret');
      table.string('temp_mfa_secret');
      table.text('security_questions');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('products', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.decimal('price').notNullable();
      table.integer('stock').defaultTo(0);
      table.string('category');
      table.string('image_url');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('webhooks', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('url').notNullable();
      table.text('events').notNullable();
      table.string('secret');
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('files', table => {
      table.increments('id').primary();
      table.string('filename').notNullable();
      table.string('path').notNullable();
      table.integer('size').notNullable();
      table.string('mimetype');
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    })
    .createTable('feedback', table => {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.integer('rating').notNullable();
      table.integer('user_id').references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('progress', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('category').notNullable();
      table.string('vulnerability_name').notNullable();
      table.boolean('completed').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('completed_at');
    })
    .createTable('updates', table => {
      table.increments('id').primary();
      table.string('version').notNullable();
      table.text('changelog');
      table.text('update_data');
      table.boolean('available').defaultTo(false);
      table.boolean('imported').defaultTo(false);
      table.integer('imported_by').references('id').inTable('users');
      table.timestamp('imported_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema
    .dropTable('updates')
    .dropTable('progress')
    .dropTable('feedback')
    .dropTable('files')
    .dropTable('webhooks')
    .dropTable('products')
    .dropTable('users');
};
