const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('./logger');

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
    
    // Check if there are existing users before adding demo data
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      logger.info('MongoDB already has data, skipping demo data');
      return;
    }
    
    // Add admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      logger.info('Created admin user for MongoDB');
    }
    
    // Add regular test user
    const testUserExists = await User.findOne({ username: 'testuser' });
    if (!testUserExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        createdAt: new Date()
      });
      
      logger.info('Created test user for MongoDB');
    }
    
    // Add product data
    // Note: You would need to create a Product model for MongoDB
    // This is omitted for brevity, but would follow the same pattern as the User model
    
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
    // Check if there are existing users before adding demo data
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers && existingUsers.count > 0) {
      logger.info('SQLite already has data, skipping demo data');
      return;
    }
    
    // Add admin user
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    await db.run(`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES ('admin', 'admin@example.com', '${adminPassword}', 'admin', datetime('now'))
    `);
    
    // Add regular test user
    const userPassword = await bcrypt.hash('password123', salt);
    
    await db.run(`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES ('testuser', 'test@example.com', '${userPassword}', 'user', datetime('now'))
    `);
    
    // Add some product data
    const products = [
      {
        name: 'Secure Laptop',
        description: 'A laptop with enhanced security features',
        price: 1299.99,
        category: 'Electronics',
        stock: 50
      },
      {
        name: 'Firewall Software',
        description: 'Enterprise-grade firewall solution',
        price: 299.99,
        category: 'Software',
        stock: 100
      },
      {
        name: 'Security Camera',
        description: 'HD security camera with motion detection',
        price: 149.99,
        category: 'Security',
        stock: 75
      },
      {
        name: 'Encryption Book',
        description: 'Learn about modern encryption techniques',
        price: 49.99,
        category: 'Books',
        stock: 200
      },
      {
        name: 'USB Security Key',
        description: '2FA hardware security key',
        price: 29.99,
        category: 'Accessories',
        stock: 150
      }
    ];
    
    for (const product of products) {
      await db.run(`
        INSERT INTO products (name, description, price, category, stock, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [product.name, product.description, product.price, product.category, product.stock]);
    }
    
    logger.info('Added demo products to SQLite');
    
  } catch (error) {
    logger.error('Error loading SQLite demo data:', error);
    throw error;
  }
};

// Hash passwords for demo users
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Common data for both SQLite and MongoDB
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: hashPassword('admin123'),
    role: 'admin',
    created_at: new Date(),
  },
  {
    username: 'user',
    email: 'user@example.com',
    password: hashPassword('user123'),
    role: 'user',
    created_at: new Date(),
  },
  {
    username: 'demo',
    email: 'demo@example.com',
    password: hashPassword('demo123'),
    role: 'user',
    created_at: new Date(),
  }
];

const products = [
  {
    name: 'Laptop Pro',
    description: 'High performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    stock: 50,
    created_at: new Date()
  },
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 799.99,
    category: 'Electronics',
    stock: 100,
    created_at: new Date()
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker with timer',
    price: 129.99,
    category: 'Kitchen',
    stock: 30,
    created_at: new Date()
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise cancelling wireless headphones',
    price: 199.99,
    category: 'Audio',
    stock: 75,
    created_at: new Date()
  },
  {
    name: 'Fitness Tracker',
    description: 'Track your daily activities and sleep',
    price: 89.99,
    category: 'Wearables',
    stock: 85,
    created_at: new Date()
  }
];

// Export for use in both SQLite and MongoDB seeding
module.exports = {
  loadMockData,
  users,
  products
};
    logger.info('MongoDB database seeded successfully');
  } catch (error) {
    logger.error(`MongoDB seed error: ${error.message}`);
    throw error;
  }
};

// Users data
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
    username: 'john',
    email: 'john@example.com',
    password: hashPassword('Password123'),
    role: 'user',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'alice',
    email: 'alice@example.com',
    password: hashPassword('Alice@123'),
    role: 'user',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Products data
const products = [
  {
    name: 'Laptop Pro',
    description: 'High-end laptop with the latest specifications',
    price: 1299.99,
    stock: 10,
    category: 'Electronics',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Smartphone X',
    description: 'Next generation smartphone with advanced camera',
    price: 699.99,
    stock: 15,
    category: 'Electronics',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Coffee Maker',
    description: 'Automated coffee maker with timer',
    price: 89.99,
    stock: 8,
    category: 'Appliances',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise cancelling wireless headphones',
    price: 149.99,
    stock: 12,
    category: 'Audio',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Fitness Tracker',
    description: 'Track your steps, heart rate and sleep patterns',
    price: 59.99,
    stock: 20,
    category: 'Wearables',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Feedback data
const feedback = [
  {
    user_id: 2,
    content: 'Great platform for learning security concepts!',
    rating: 5,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    user_id: 3,
    content: 'Found some interesting vulnerabilities to explore.',
    rating: 4,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Webhooks data
const webhooks = [
  {
    user_id: 1,
    name: 'New User Notification',
    url: 'https://webhook.site/test-endpoint',
    events: JSON.stringify(['user.created']),
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Seed demo data if tables are empty
const seedDemoData = async (db) => {
  try {
    // Check if users table is empty
    const userCount = await db('users').count('id as count').first();
    
    if (userCount.count === 0) {
      logger.info('Seeding demo users...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db('users').insert({
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
      });
      
      // Create regular user
      const userPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({
        username: 'user',
        email: 'user@example.com',
        password: userPassword,
        role: 'user'
      });
      
      logger.info('Demo users seeded successfully');
    }
    
    // Check if products table is empty
    const productCount = await db('products').count('id as count').first();
    
    if (productCount.count === 0) {
      logger.info('Seeding demo products...');
      
      const products = [
        {
          name: 'Secure Laptop',
          description: 'A secure laptop with encryption features',
          price: 999.99,
          stock: 10,
          category: 'Electronics'
        },
        {
          name: 'Firewall Pro',
          description: 'Enterprise grade firewall solution',
          price: 299.99,
          stock: 20,
          category: 'Software'
        },
        {
          name: 'Advanced Antivirus',
          description: 'Protect your system from malware and viruses',
          price: 49.99,
          stock: 100,
          category: 'Software'
        },
        {
          name: 'Hardware Key',
          description: 'Physical authentication device',
          price: 79.99,
          stock: 30,
          category: 'Security'
        },
        {
          name: 'Network Scanner',
          description: 'Detect vulnerabilities in your network',
          price: 199.99,
          stock: 15,
          category: 'Tools'
        },
      ];
      
      await db('products').insert(products);
      logger.info('Demo products seeded successfully');
    }
    
    return true;
  } catch (error) {
    logger.error(`Demo data seeding error: ${error.message}`);
    return false;
  }
};

module.exports = {
  seedSqlite,
  seedMongo,
  users,
  products,
  feedback,
  webhooks
};
