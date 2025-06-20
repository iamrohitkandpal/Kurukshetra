const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const logger = require('../utils/logger');

let db;

const initializeDb = async () => {
  try {
    if (!db) {
      db = await open({
        filename: process.env.DB_PATH || path.join(__dirname, '../data/kurukshetra.sqlite3'),
        driver: sqlite3.Database
      });
      
      logger.info('SQLite database connection established');
      await createTables();
    }
    return db;
  } catch (error) {
    logger.error('SQLite database connection error:', error);
    throw error;
  }
};

const getDb = async () => {
  if (!db) {
    await initializeDb();
  }
  return db;
};

/**
 * Create necessary tables if they don't exist
 */
const createTables = async () => {
  try {
    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        api_key TEXT,
        mfa_secret TEXT,
        mfa_enabled INTEGER DEFAULT 0,
        reset_token TEXT,
        reset_token_expiry TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Files table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        path TEXT NOT NULL,
        mimetype TEXT,
        size INTEGER,
        uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Feedback table - Vulnerable to XSS
    await db.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Webhooks table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Progress tracking table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT NOT NULL,
        vulnerability_name TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Security questions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS security_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // System logs table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        user TEXT,
        ip TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Personal data table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS personal_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        phone_number TEXT,
        ssn TEXT,
        date_of_birth TEXT,
        address TEXT,
        bank_account TEXT,
        national_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    logger.info('SQLite tables created or already exist');
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
};

// Update the module exports
module.exports = {
  initializeDb,
  getDb,
  get: async (query, params = []) => {
    const database = await getDb();
    try {
      return await database.get(query, params);
    } catch (error) {
      logger.error('SQLite query error:', error, query);
      throw error;
    }
  }
};
