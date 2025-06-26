const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('./logger');
const models = require('../models/sqlite');

async function migrate() {
  console.log('=== Starting Migration Script ===');
  let sequelize;

  try {
    sequelize = new Sequelize(config.db.sqlite);
    logger.info('Authenticating DB connection...');
    await sequelize.authenticate();

    const modelNames = Object.keys(models);
    for (const name of modelNames) {
      if (typeof models[name].sync === 'function') {
        logger.info(`Syncing model: ${name}`);
        await models[name].sync({ alter: true });
      }
    }

    console.log('=== Migration Complete ===');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('=== Migration Failed ===');
    logger.error('Migration failed:', error);
    if (sequelize) await sequelize.close();
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  try {
    await migrate();
  } catch (error) {
    console.error('Migration execution failed:', error);
    process.exit(1);
  }
})();
