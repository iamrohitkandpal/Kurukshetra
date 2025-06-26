const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();
const { DB_TYPE, MONGODB_URI } = process.env;

async function setup() {
  console.log('=== Starting Setup Script ===');
  try {
    // Create required directories
    const dirs = ['logs', 'data', 'uploads'];
    for (const dir of dirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }

    if (DB_TYPE === 'mongodb') {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('MongoDB connected successfully');
      await mongoose.disconnect();
    } else {
      logger.info('Initializing SQLite...');
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/kurukshetra.sqlite'),
      });
      await sequelize.authenticate();
      logger.info('SQLite initialized successfully');
      await sequelize.close();
    }

    console.log('=== Setup Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('=== Setup Failed ===');
    logger.error('Setup failed:', error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  try {
    await setup();
  } catch (error) {
    console.error('Setup execution failed:', error);
    process.exit(1);
  }
})();