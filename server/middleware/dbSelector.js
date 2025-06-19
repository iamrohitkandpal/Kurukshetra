const { getActiveDb } = require('../config/dbManager');
const logger = require('../utils/logger');

/**
 * Middleware to determine which database to use
 */
const dbSelector = (req, res, next) => {
  try {
    // Priority: 1. Query param 2. Body param 3. Current active DB
    req.dbType = req.query.db || req.body.db || getActiveDb();
    
    // Validate database type
    if (req.dbType !== 'sqlite' && req.dbType !== 'mongodb') {
      req.dbType = 'sqlite'; // Default to SQLite
    }
    
    next();
  } catch (error) {
    logger.error('Database selector error:', error);
    req.dbType = 'sqlite'; // Default to SQLite in case of error
    next();
  }
};

module.exports = dbSelector;