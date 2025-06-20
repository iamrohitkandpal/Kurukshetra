const { getCurrentDbType, getDb, getMongoDb } = require('../config/dbManager');
const logger = require('../utils/logger');

/**
 * Middleware to determine which database to use
 */
const dbSelector = (req, res, next) => {
  try {
    // Use getCurrentDbType instead of getActiveDb
    req.dbType = req.query.db || req.body.db || getCurrentDbType();
    
    // Validate database type
    if (req.dbType !== 'sqlite' && req.dbType !== 'mongodb') {
      req.dbType = 'sqlite'; // Default to SQLite
    }
    
    // Attach the appropriate database connection to request
    req.db = req.dbType === 'mongodb' ? getMongoDb() : getDb();
    
    next();
  } catch (error) {
    logger.error('Database selector error:', error);
    req.dbType = 'sqlite'; // Default to SQLite in case of error
    next();
  }
};

module.exports = dbSelector;