const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Load demo data into the selected database
 */
const loadMockData = async (dbType) => {
  try {
    if (dbType === 'mongodb') {
      await loadMongoData();
    } else {
      await loadSqliteData();
    }
    logger.info(`Demo data loaded for ${dbType} database`);
    return true;
  } catch (error) {
    logger.error('Error loading demo data:', error);
    return false;
  }
};

/**
 * Load demo data into MongoDB
 */
const loadMongoData = async () => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/mongo/User');
    const Product = require('../models/mongo/Product');
    const Feedback = require('../models/mongo/Feedback');
    const Webhook = require('../models/mongo/Webhook');

    // Check if there are existing users
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      logger.info('MongoDB already has data, skipping demo data');
      return;
    }

    // Create users with stored references for relationships
    const createdUsers = await User.insertMany(users);
    logger.info('Created demo users for MongoDB');

    // Create products
    await Product.insertMany(products);
    logger.info('Created demo products for MongoDB');

    // Create feedback with proper user references
    const feedbackData = feedback.map(f => ({
      ...f,
      user_id: createdUsers[f.user_id - 1]._id
    }));
    await Feedback.insertMany(feedbackData);
    logger.info('Created demo feedback for MongoDB');

    // Create webhooks with proper user references
    const webhookData = webhooks.map(w => ({
      ...w,
      user_id: createdUsers[w.user_id - 1]._id
    }));
    await Webhook.insertMany(webhookData);
    logger.info('Created demo webhooks for MongoDB');

  } catch (error) {
    logger.error('Error loading MongoDB demo data:', error);
    throw error;
  }
};

/**
 * Load demo data into SQLite
 */
const loadSqliteData = async () => {
  try {
    // Check existing data
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers && existingUsers.count > 0) {
      logger.info('SQLite already has data, skipping demo data');
      return;
    }

    // Insert users
    for (const user of users) {
      await db.run(`
        INSERT INTO users (username, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.username, user.email, user.password, user.role, user.created_at, user.updated_at]);
    }

    // Insert products
    for (const product of products) {
      await db.run(`
        INSERT INTO products (name, description, price, stock, category, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [product.name, product.description, product.price, product.stock, 
          product.category, product.created_at, product.updated_at]);
    }

    // Insert feedback
    for (const f of feedback) {
      await db.run(`
        INSERT INTO feedback (user_id, content, rating, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `, [f.user_id, f.content, f.rating, f.created_at, f.updated_at]);
    }

    // Insert webhooks
    for (const w of webhooks) {
      await db.run(`
        INSERT INTO webhooks (user_id, name, url, events, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [w.user_id, w.name, w.url, w.events, w.created_at, w.updated_at]);
    }

    logger.info('Added all demo data to SQLite');
  } catch (error) {
    logger.error('Error loading SQLite demo data:', error);
    throw error;
  }
};

// Hash password helper
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(5); // Intentionally weak for demo
  return bcrypt.hashSync(password, salt);
};

// Define the demo data
const users = [
  {
    username: 'admin',
    email: 'admin@kurukshetra.com',
    password: hashPassword('Admin@123'),
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'manager',
    email: 'manager@kurukshetra.com',
    password: hashPassword('Manager@123'),
    role: 'manager',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'user',
    email: 'user@kurukshetra.com',
    password: hashPassword('User@123'),
    role: 'user',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const products = [
  {
    name: 'Secure Laptop Pro',
    description: 'High-performance laptop with built-in security features',
    price: 1299.99,
    stock: 25,
    category: 'Electronics',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Network Scanner',
    description: 'Professional network vulnerability scanner',
    price: 499.99,
    stock: 15,
    category: 'Security Tools',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Encrypted USB Drive',
    description: 'Hardware-encrypted USB drive with military-grade protection',
    price: 129.99,
    stock: 50,
    category: 'Storage',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Security Camera System',
    description: 'Complete security camera system with 4 HD cameras',
    price: 399.99,
    stock: 10,
    category: 'Surveillance',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const feedback = [
  {
    user_id: 2,
    content: 'Great platform for security training!',
    rating: 5,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    user_id: 3,
    content: 'The SQLi challenges are really helpful',
    rating: 4,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const webhooks = [
  {
    user_id: 1,
    name: 'Security Alert Webhook',
    url: 'https://security.example.com/alerts',
    events: JSON.stringify(['user.login', 'user.failed_login']),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    user_id: 2,
    name: 'Audit Log Webhook',
    url: 'https://audit.example.com/logs',
    events: JSON.stringify(['product.created', 'product.updated']),
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  loadMockData,
  users,
  products,
  feedback,
  webhooks
};
