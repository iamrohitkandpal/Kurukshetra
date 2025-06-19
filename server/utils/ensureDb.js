const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const knex = require('knex');
const config = require('../knexfile');
const mongoose = require('mongoose');
const demoData = require('./demoData');

const db = require('../config/db');  

// Ensure SQLite database directory exists
const ensureSqliteDb = () => {
  // Use relative path for better Render compatibility
  const dbPath = process.env.DB_PATH || './data/database.sqlite';
  const dbDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dbDir)) {
    logger.info(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Initialize the database
  const environment = process.env.NODE_ENV || 'development';
  const knexConfig = {
    ...config[environment],
    connection: {
      filename: dbPath
    }
  };
  
  const db = knex(knexConfig);
  
  // Run migrations if needed
  db.migrate.latest()
    .then(() => {
      logger.info('SQLite database migrations completed successfully');
      
      // Seed data if SEED_DATA is true
      if (process.env.SEED_DATA === 'true') {
        return db.seed.run()
          .then(() => {
            logger.info('SQLite database seeded successfully');
          })
          .catch(err => {
            logger.error('Error seeding SQLite database:', err);
          });
      }
    })
    .catch(err => {
      logger.error('Error running SQLite migrations:', err);
    });
    
  return db;
};

// Ensure MongoDB connection and seeding
const ensureMongoDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kurukshetra';
    
    // Check if mongoose is already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('Connected to MongoDB successfully');
    }
    
    // Seed MongoDB with demo data if SEED_DATA is true
    if (process.env.SEED_DATA === 'true') {
      await seedMongoDb();
      logger.info('MongoDB database seeded successfully');
    }
    
    return mongoose.connection;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Seed MongoDB with demo data
const seedMongoDb = async () => {
  try {
    const mongoose = require('mongoose');
    
    // Ensure MongoDB models are loaded
    require('../models/mongo/User');
    require('../models/mongo/Product');
    require('../models/mongo/Feedback');
    
    // Only proceed with loading default data if specified collections don't exist
    // or are empty
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if 'users' collection exists and has documents
    if (!collectionNames.includes('users')) {
      logger.info('Users collection not found in MongoDB, seeding demo data...');
      await loadMongoDbSeed();
    } else {
      // Check if collection is empty
      const userCount = await db.collection('users').countDocuments();
      if (userCount === 0) {
        logger.info('Users collection is empty in MongoDB, seeding demo data...');
        await loadMongoDbSeed();
      } else {
        logger.info('MongoDB already has data, skipping seed');
      }
    }
    
    return true;
  } catch (error) {
    logger.error('Error seeding MongoDB:', error);
    throw error;
  }
};

// Helper function to load MongoDB data
const loadMongoDbSeed = async () => {
  try {
    // Use the demoData module to load data
    await require('./demoData').loadMockData('mongodb');
    logger.info('MongoDB demo data loaded successfully');
    return true;
  } catch (error) {
    logger.error('Error loading MongoDB demo data:', error);
    throw error;
  }
};

// Initialize the database based on the DB_TYPE
const initializeDb = async () => {
  try {
    // Initialize both databases regardless of the DB_TYPE setting
    // This ensures both are ready for use via the database switcher
    const sqliteDb = await ensureSqliteDb();
    logger.info('SQLite database initialized');
    
    const mongoDb = await ensureMongoDb();
    logger.info('MongoDB database initialized');
    
    // Return the default database based on environment
    const dbType = process.env.DB_TYPE || 'sqlite';
    return dbType === 'mongodb' ? mongoDb : sqliteDb;
  } catch (error) {
    logger.error('Error initializing databases:', error);
    throw error;
  }
};

module.exports = {
  ensureSqliteDb,
  ensureMongoDb,
  initializeDb
};