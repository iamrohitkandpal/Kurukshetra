const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();
const { DB_TYPE, MONGODB_URI } = process.env;
let sequelize;

async function setup() {
  // Create required directories
  const dirs = ['logs', 'data'];
  dirs.forEach((dir) => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });

  try {
    // Initialize database
    if (DB_TYPE === 'mongodb') {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('MongoDB connected successfully');
    } else {
      logger.info('Initializing SQLite...');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/kurukshetra.sqlite'),
      });
      await sequelize.authenticate();
      logger.info('SQLite initialized successfully');
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

async function validateConnections() {
  if (DB_TYPE === 'sqlite') {
    await sequelize.authenticate();
  } else if (DB_TYPE === 'mongodb') {
    await mongoose.connection.db.admin().ping();
  }
}

// If this file is run directly, call setup
if (require.main === module) {
  setup();
}

module.exports = { setup, validateConnections };
