const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { getDb } = require('../config/dbManager'); 
const logger = require('./logger');
const { demoUsers, demoProducts, demoFeedback } = require('./demoData');
const { initializeDb } = require('../config/db');

dotenv.config();

const setupDemoData = async () => {
  try {
    await setupSqliteData();
    await setupMongoData();
    logger.info('Demo data setup completed successfully');
  } catch (err) {
    logger.error(`Error setting up demo data: ${err.message}`);
    throw err;
  }
};

const setupSqliteData = async () => {
  const db = await getDb('sqlite');

  await ensureDbExists();
  await db.schema.dropTableIfExists('users');
  await db.schema.dropTableIfExists('products');
  await db.schema.dropTableIfExists('feedback');
  await db.schema.dropTableIfExists('files');
  await db.schema.dropTableIfExists('progress');
  await db.schema.dropTableIfExists('security_questions');
  await db.schema.dropTableIfExists('webhooks');

  await db.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('role').defaultTo('user');
    table.string('api_key');
    table.boolean('mfa_enabled').defaultTo(false);
    table.string('mfa_secret');
    table.timestamps(true, true);
  });

  await db.schema.createTable('products', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 10, 2);
    table.integer('stock').defaultTo(0);
    table.string('category');
    table.string('image_url');
    table.timestamps(true, true);
  });

  await db.schema.createTable('feedback', table => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.integer('rating').defaultTo(5);
    table.integer('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });

  await db.schema.createTable('files', table => {
    table.increments('id').primary();
    table.string('filename');
    table.integer('size');
    table.string('path');
    table.integer('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });

  await db.schema.createTable('progress', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users');
    table.string('category').notNullable();
    table.string('vulnerability').notNullable();
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });

  await db.schema.createTable('security_questions', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users');
    table.string('question').notNullable();
    table.string('answer').notNullable();
    table.timestamps(true, true);
  });

  await db.schema.createTable('webhooks', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('url').notNullable();
    table.json('events');
    table.string('secret');
    table.integer('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });

  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 5);
    await db('users').insert({
      username: user.username,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    });
  }

  await db('products').insert(demoProducts);
  await db('feedback').insert(demoFeedback);

  logger.info('SQLite demo data setup complete');
};

const setupMongoData = async () => {
  const db = await getDb('mongodb');

  const collections = ['users', 'products', 'feedback'];
  for (const col of collections) {
    if ((await db.listCollections({ name: col }).toArray()).length) {
      await db.collection(col).drop();
    }
  }

  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 5);
    await db.collection('users').insertOne({
      username: user.username,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  await db.collection('products').insertMany(demoProducts.map(p => ({
    ...p,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  await db.collection('feedback').insertMany(demoFeedback.map(f => ({
    ...f,
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  logger.info('MongoDB demo data setup complete');
};

const setupDatabase = async () => {
  try {
    await ensureDbExists();
    await initDatabases();
    await setupDemoData();
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  }
};

module.exports = {
  setupDemoData,
  setupDatabase
};
