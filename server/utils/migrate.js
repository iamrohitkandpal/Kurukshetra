const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('./logger');

async function validateSchema(models) {
  const requiredModels = [
    'User', 'Product', 'File', 'Feedback', 
    'Webhook', 'Progress', 'AuditLog'
  ];

  const missingModels = requiredModels.filter(model => !models[model]);
  if (missingModels.length > 0) {
    throw new Error(`Missing required models: ${missingModels.join(', ')}`);
  }

  logger.info('Schema validation successful');
}

async function executeMigrations(sequelize, models) {
  try {
    logger.info('Starting database migrations...');

    // Sync models in specific order to handle dependencies
    const migrationOrder = [
      'User',
      'Product',
      'File',
      'Feedback',
      'Webhook',
      'Progress',
      'AuditLog'
    ];

    for (const modelName of migrationOrder) {
      logger.info(`Migrating ${modelName} model...`);
      await models[modelName].sync({ alter: true });
    }

    // Create indexes
    await Promise.all([
      models.User.sync({ force: false, indexes: true }),
      models.Product.sync({ force: false, indexes: true }),
      models.AuditLog.sync({ force: false, indexes: true })
    ]);

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

async function migrate() {
  let sequelize;
  try {
    // Initialize sequelize
    sequelize = new Sequelize(config.db.sqlite);
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Initialize models
    const models = require('../models/sqlite')(sequelize);
    
    // Validate schema
    await validateSchema(models);
    
    // Execute migrations
    await executeMigrations(sequelize, models);

    if (require.main === module) {
      await sequelize.close();
      process.exit(0);
    }
  } catch (error) {
    logger.error('Migration failed:', error);
    if (sequelize) {
      await sequelize.close();
    }
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

// Add to migrate.js
async function validateMongoSchema(connection) {
  const collections = await connection.db.listCollections().toArray();
  const requiredCollections = [
    'users', 'products', 'files', 'feedback',
    'webhooks', 'progress', 'auditlogs'
  ];

  const missingCollections = requiredCollections.filter(
    coll => !collections.find(c => c.name === coll)
  );
  if (missingCollections.length > 0) {
    throw new Error(`Missing required collections: ${missingCollections.join(', ')}`);
  }

  logger.info('MongoDB schema validation successful');
}

async function createIndexes(models) {
  await Promise.all([
    models.User.createIndexes(),
    models.Product.createIndexes(),
    models.AuditLog.createIndexes()
  ]);
}

// Run migration if called directly
if (require.main === module) {
  migrate();
} else {
  module.exports = migrate;
}