exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id');
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').defaultTo('user');
      table.timestamps(true, true);
    })
    .createTable('products', (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.text('description');
      table.decimal('price', 10, 2);
      table.integer('stock');
      table.timestamps(true, true);
    })
    .createTable('vulnerabilities', (table) => {
      table.increments('id');
      table.string('name').notNullable();
      table.string('category');
      table.text('description');
      table.text('solution');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('vulnerabilities')
    .dropTable('products')
    .dropTable('users');
};
