#!/usr/bin/env node
/**
 * Kurukshetra - Database Reset Script
 * Completely wipes the database and recreates the required schema
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// Import the centralized database initialization
const { initializeDatabase, getDatabase } = require('../src/lib/db');

// Database connection variables
let db;
let isMongoDb = false;
let UserModel;

async function setupDatabaseConnection() {
  try {
    await initializeDatabase();
    const { database, mongoose } = getDatabase();
    
    const DB_TYPE = process.env.DB_TYPE || 'sqlite';
    
    if (DB_TYPE === 'mongo') {
      isMongoDb = true;
      // Define MongoDB schema if not already defined
      const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        flagsFound: { type: [String], default: [] }
      });
      
      UserModel = mongoose.models.User || mongoose.model('User', userSchema);
      console.log('📊 Connected to MongoDB');
    } else {
      db = database;
      console.log('📊 Connected to SQLite database');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function resetDatabase() {
  try {
    await setupDatabaseConnection();
    
    if (isMongoDb) {
      // Drop all users
      await UserModel.deleteMany();
      console.log('🗑️ All MongoDB users deleted');
    } else {
      // Remove all users and recreate table for SQLite
      await db.exec('DROP TABLE IF EXISTS users;');
      await db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          flagsFound TEXT DEFAULT '[]',
          role TEXT DEFAULT 'user',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          lastLogin DATETIME,
          isActive BOOLEAN DEFAULT 1,
          profile TEXT DEFAULT '{}'
        );
      `);
      console.log('🗑️ All SQLite users deleted');
    }

    console.log('✨ Database has been reset successfully');
  } catch (error) {
    console.error('❌ Failed to reset database:', error.message);
    process.exit(1);
  }
}

// Run reset if script is executed directly
if (require.main === module) {
  resetDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

