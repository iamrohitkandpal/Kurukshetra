const { Sequelize } = require('sequelize');
const config = require('../config/config');
const sqliteModelsInit = require('../models/sqlite');

// Simple migration utility for SQLite schema sync
async function migrate() {
  try {
    // Initialize sequelize with SQLite config
    const sequelize = new Sequelize(config.db.sqlite);
    
    // Initialize models
    const models = sqliteModelsInit(sequelize);
    
    // Sync all models
    console.log('Starting SQLite schema sync...');
    for (let key in models) {
      if (models[key].sync) {
        console.log(`Syncing ${key} model...`);
        await models[key].sync();
      }
    }
    
    console.log('SQLite models synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
} else {
  module.exports = migrate;
}