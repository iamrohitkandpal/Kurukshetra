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
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('Connected to MongoDB successfully');
    
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
    const { User } = require('../models/mongo/User');
    
    // Check if we already have users to avoid duplicate seeding
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info('MongoDB already has data, skipping seed');
      return;
    }
    
    // Insert demo users
    await User.insertMany(demoData.users);
    
    // Insert other demo data...
    // You can add more collections here as needed
    
    logger.info('MongoDB demo data seeded successfully');
  } catch (error) {
    logger.error('Error seeding MongoDB:', error);
    throw error;
  }
};

// Initialize the database based on the DB_TYPE
const initializeDb = async () => {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  switch (dbType) {
    case 'mongodb':
      return await ensureMongoDb();
    case 'sqlite':
    default:
      return ensureSqliteDb();
  }
};

module.exports = {
  ensureSqliteDb,
  ensureMongoDb,
  initializeDb
};