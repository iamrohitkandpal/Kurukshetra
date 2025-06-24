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
  try {
    // Create required directories
    const dirs = ['logs', 'data'];
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
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/kurukshetra.sqlite'),
      });
      await sequelize.authenticate();
      logger.info('SQLite initialized successfully');
      await sequelize.close();
    }

    logger.info('Setup complete.');
    process.exit(0);
  } catch (error) {
    logger.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };
