const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const config = require('./config');
const mongoModels = require('../models/mongo');
const sqliteModels = require('../models/sqlite');
const path = require('path');
const logger = require('../utils/logger');
const fs = require('fs');

let currentDb = null;
let sequelize = null;
let models = null;

// Add connection state tracking
let connectionState = {
  isConnecting: false,
  lastError: null,
  reconnectAttempts: 0
};

async function validateModels(dbType) {
  const modelPath = path.join(__dirname, '..', 'models', dbType);
  const requiredModels = ['User', 'Product', 'Feedback', 'Progress', 'File', 'AuditLog', 'Webhook'];

  try {
    // Check if model directory exists
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model directory for ${dbType} not found`);
    }

    // Verify each required model
    for (const model of requiredModels) {
      const modelFile = path.join(modelPath, `${model}.js`);
      if (!fs.existsSync(modelFile)) {
        throw new Error(`Required model ${model}.js not found for ${dbType}`);
      }
    }

    logger.info(`Model validation successful for ${dbType}`);
    return true;
  } catch (error) {
    logger.error('Model validation failed:', error);
    throw error;
  }
}

async function initializeDatabase() {
  const dbType = process.env.DB_TYPE || 'sqlite';

  try {
    // Validate models first
    await validateModels(dbType);

    // Initialize database based on type
    if (dbType === 'mongodb') {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('MongoDB connected successfully');
    } else {
      const sqlite = require('sqlite3').verbose();
      const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');

      // Ensure data directory exists
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }

      // Initialize SQLite database
      const db = new sqlite.Database(dbPath);
      logger.info('SQLite database initialized');
    }

    logger.info(`Database initialization complete (${dbType})`);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// Add connection retry logic
async function connectWithRetry(type, maxAttempts = 3) {
  while (connectionState.reconnectAttempts < maxAttempts) {
    try {
      // ... existing connection logic
      connectionState.reconnectAttempts = 0;
      return true;
    } catch (error) {
      connectionState.lastError = error;
      connectionState.reconnectAttempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Failed to connect after ${maxAttempts} attempts`);
}

const dbManager = {
  async switchDatabase(type) {
    try {
      console.log(`Attempting to switch database to: ${type}`);

      if (currentDb) {
        if (type === 'sqlite' && sequelize) {
          await sequelize.close();
          console.log('Closed SQLite connection');
        } else if (type === 'mongodb' && mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
          console.log('Closed MongoDB connection');
        }
      }

      if (type === 'sqlite') {
        sequelize = new Sequelize(config.db.sqlite);
        await sequelize.authenticate();
        currentDb = 'sqlite';
        models = sqliteModels(sequelize);
        console.log('SQLite connection established successfully.');
        return { type: 'sqlite', instance: sequelize, models };
      } else if (type === 'mongodb') {
        await mongoose.connect(config.db.mongodb.url, config.db.mongodb.options);
        currentDb = 'mongodb';
        models = mongoModels;
        console.log('MongoDB connection established successfully.');
        return { type: 'mongodb', instance: mongoose, models };
      }

      throw new Error(`Unknown database type: ${type}`);
    } catch (error) {
      console.error('Database connection error:', error.stack);
      throw new Error(`Failed to switch to ${type}: ${error.message}`);
    }
  },

  getCurrentDb() {
    return currentDb;
  },

  getConnection() {
    if (!currentDb) {
      throw new Error('No database connection established');
    }
    return {
      instance: currentDb === 'sqlite' ? sequelize : mongoose,
      models,
      type: currentDb
    };
  }
};

// Add proper cleanup
async function cleanup() {
  if (currentDb === 'sqlite' && sequelize) {
    await sequelize.close();
  } else if (currentDb === 'mongodb' && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

// Add to exports
module.exports = { dbManager, initializeDatabase, validateModels, cleanup };
