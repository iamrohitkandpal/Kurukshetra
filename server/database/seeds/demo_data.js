/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');

exports.seed = async function(knex) {
  try {
    // Clean all tables
    await knex('users').del();
    await knex('products').del();
    await knex('webhooks').del();
    await knex('feedback').del();
    
    // A07: Weak password hashing for demo users
    const salt = await bcrypt.genSalt(5);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);
    
    // Insert demo users
    const [adminId, userId] = await knex('users').insert([
      {
        username: 'admin',
        email: 'admin@kurukshetra.local',
        password: adminPassword,
        role: 'admin',
        created_at: knex.fn.now()
      },
      {
        username: 'testuser',
        email: 'user@kurukshetra.local',
        password: userPassword,
        role: 'user',
        created_at: knex.fn.now()
      }
    ]).returning('id');
    
    // Insert demo products
    await knex('products').insert([
      {
        name: 'Secure Laptop Pro',
        description: 'A high-performance laptop with built-in security features',
        price: 1299.99,
        stock: 25,
        category: 'Electronics',
        created_at: knex.fn.now()
      },
      {
        name: 'Network Scanner Tool',
        description: 'Professional tool for network vulnerability scanning',
        price: 499.50,
        stock: 10,
        category: 'Security Tools',
        created_at: knex.fn.now()
      },
      {
        name: 'Encryption USB Drive',
        description: '256-bit AES hardware-encrypted USB flash drive',
        price: 79.99,
        stock: 50,
        category: 'Storage',
        created_at: knex.fn.now()
      },
      {
        name: 'Security Camera System',
        description: 'Complete home security camera system with 4 cameras',
        price: 349.99,
        stock: 15,
        category: 'Security Equipment',
        created_at: knex.fn.now()
      },
      {
        name: 'Password Manager Premium',
        description: '1-year subscription to our secure password management service',
        price: 39.99,
        stock: 100,
        category: 'Software',
        created_at: knex.fn.now()
      },
      {
        name: 'VPN Annual Subscription',
        description: 'Secure your internet connection with our high-speed VPN',
        price: 59.99,
        stock: 200,
        category: 'Software',
        created_at: knex.fn.now()
      }
    ]);
    
    // Insert some sample feedback
    await knex('feedback').insert([
      {
        content: 'Great platform for learning about security vulnerabilities!',
        rating: 5,
        user_id: userId
      },
      {
        content: 'The SQL injection challenges are really educational.',
        rating: 4,
        user_id: userId
      }
    ]);
    
    // Insert sample progress for test user
    const progressCategories = {
      'A01': 'Broken Access Control',
      'A02': 'Cryptographic Failures',
      'A03': 'Injection',
      'A04': 'Insecure Design',
      'A05': 'Security Misconfiguration',
      'A06': 'Vulnerable Components',
      'A07': 'Auth & Identity Failures',
      'A08': 'Software & Data Integrity Failures',
      'A09': 'Security Logging/Monitoring Failures',
      'A10': 'Server-Side Request Forgery'
    };
    
    const progressEntries = [];
    
    Object.keys(progressCategories).forEach(category => {
      progressEntries.push({
        user_id: userId,
        category,
        vulnerability_name: 'introduction',
        completed: false
      });
    });
    
    await knex('progress').insert(progressEntries);
    
    logger.info('Demo data seeded successfully');
  } catch (error) {
    logger.error(`Seed error: ${error.message}`);
    throw error;
  }
};
