const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('./logger');
const models = require('../models/sqlite'); // index.js exports all models as object

async function migrate() {
  const sequelize = new Sequelize(config.db.sqlite);

  try {
    logger.info('Authenticating DB connection...');
    await sequelize.authenticate();

    const modelNames = Object.keys(models);
    for (const name of modelNames) {
      if (typeof models[name].sync === 'function') {
        logger.info(`Syncing model: ${name}`);
        await models[name].sync({ alter: true });
      }
    }

    logger.info('Migration completed successfully.');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    if (sequelize) await sequelize.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
