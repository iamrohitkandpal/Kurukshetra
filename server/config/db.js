const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const md5 = require('md5'); // For the intentional weak hash demonstration

const dbPath = path.join(__dirname, '..', 'database', 'kurukshetra.sqlite');

// Database configuration
const db = {
  getDb: async () => {
    try {
      const database = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      return database;
    } catch (err) {
      console.error('Database connection error:', err);
      throw err;
    }
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const database = await db.getDb();
    await database.raw('SELECT 1');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

// Initialize database with schema and initial data
const initDatabase = async () => {
  const database = await db.getDb();

  // Create users table
  await database.schema.hasTable('users').then(exists => {
    if (!exists) {
      return database.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table.string('api_key');
        table.timestamp('created_at').defaultTo(database.fn.now());
      });
    }
  });

  // Create products table
  await database.schema.hasTable('products').then(exists => {
    if (!exists) {
      return database.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.float('price').notNullable();
        table.string('image_url');
        table.string('category');
        table.integer('stock').defaultTo(0);
      });
    }
  });

  // Create orders table
  await database.schema.hasTable('orders').then(exists => {
    if (!exists) {
      return database.schema.createTable('orders', table => {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users');
        table.float('total').notNullable();
        table.string('status').defaultTo('pending');
        table.timestamp('created_at').defaultTo(database.fn.now());
      });
    }
  });

  // Create feedback table
  await database.schema.hasTable('feedback').then(exists => {
    if (!exists) {
      return database.schema.createTable('feedback', table => {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users');
        table.text('content').notNullable();
        table.integer('rating');
        table.integer('approved').defaultTo(0);
        table.timestamp('created_at').defaultTo(database.fn.now());
      });
    }
  });

  // Create files table
  await database.schema.hasTable('files').then(exists => {
    if (!exists) {
      return database.schema.createTable('files', table => {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users');
        table.string('filename').notNullable();
        table.string('path').notNullable();
        table.string('type');
        table.integer('size');
        table.timestamp('uploaded_at').defaultTo(database.fn.now());
      });
    }
  });

  // Insert initial data
  await insertInitialData();
};

const insertInitialData = async () => {
  const database = await db.getDb();

  // Check if admin user exists
  const adminUser = await database('users').where('username', 'admin').first();
  
  if (!adminUser) {
    // A02: Cryptographic Failure - Using MD5 for passwords (intentional)
    
    // Insert admin user with weak password hash (md5)
    await database('users').insert({
      username: 'admin',
      email: 'admin@vulnerable.app',
      password: md5('admin123'),
      role: 'admin',
      api_key: 'admin-api-key-1234567890'
    });
    console.log('Admin user created');
    
    // Insert regular user
    await database('users').insert({
      username: 'user',
      email: 'user@vulnerable.app',
      password: md5('password123'),
      role: 'user'
    });
    console.log('Regular user created');
  }
  
  // Insert sample products
  const productCount = await database('products').count('* as count').first();
  
  if (productCount.count === 0) {
    const products = [
      { name: 'Laptop', description: 'High performance laptop', price: 999.99, category: 'electronics', stock: 10 },
      { name: 'Smartphone', description: 'Latest smartphone model', price: 499.99, category: 'electronics', stock: 15 },
      { name: 'Headphones', description: 'Noise cancelling', price: 99.99, category: 'accessories', stock: 20 }
    ];
    
    await database('products').insert(products);
    console.log('Sample products created');
  }
};

// Call test connection
testConnection();

module.exports = { db, initDatabase };
