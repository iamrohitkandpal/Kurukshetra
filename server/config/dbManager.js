const mongoose = require('mongoose');
const { ensureSqliteDb, ensureMongoDb } = require('../utils/ensureDb');
const logger = require('../utils/logger');

let currentDbType = process.env.DB_TYPE || 'sqlite';
let sqliteDb = null;
let mongoDb = null;

/**
 * Initialize database connections
 */
const initializeConnections = async () => {
  try {
    // Initialize SQLite
    sqliteDb = ensureSqliteDb();
    
    // Initialize MongoDB
    mongoDb = await ensureMongoDb();
    
    logger.info('All database connections initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize database connections:', error);
    throw error;
  }
};

/**
 * Get the current database instance
 */
const getDb = () => {
  return currentDbType === 'mongodb' ? mongoDb : sqliteDb;
};

/**
 * Switch database type
 */
const switchDbType = async (type) => {
  if (!['sqlite', 'mongodb'].includes(type)) {
    throw new Error(`Invalid database type: ${type}`);
  }
  
  // If already using this type, no need to switch
  if (type === currentDbType) {
    return { success: true, message: `Already using ${type}` };
  }
  
  try {
    // Make sure both connections are initialized
    if (!sqliteDb || !mongoDb) {
      await initializeConnections();
    }
    
    // Update the current DB type
    currentDbType = type;
    
    logger.info(`Switched database to ${type}`);
    return { success: true, message: `Switched to ${type}` };
  } catch (error) {
    logger.error(`Failed to switch database to ${type}:`, error);
    throw error;
  }
};

/**
 * Get current database type
 */
const getCurrentDbType = () => {
  return currentDbType;
};

module.exports = {
  initializeConnections,
  getDb,
  switchDbType,
  getCurrentDbType
};