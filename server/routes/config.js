const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route GET /api/config
 * @desc Get application configuration
 * @access Private (Admin only)
 */
router.get('/', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // A02: Sensitive information disclosure
    // A05: Security Misconfiguration - exposing configuration
    const config = {
      database: {
        sqlite: {
          filename: 'db.sqlite3',
          path: path.join(__dirname, '../../data/db.sqlite3')
        },
        mongodb: {
          // A02: Exposing connection string with credentials
          uri: process.env.MONGO_URI || 'mongodb://username:password@localhost:27017/kurukshetra'
        }
      },
      server: {
        port: process.env.PORT || 5000,
        env: process.env.NODE_ENV || 'development',
        secretKey: process.env.JWT_SECRET || 'default_jwt_secret_key', // A02: Exposing secret key
        sessionTimeout: 3600 // 1 hour
      },
      email: {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'user@example.com', // A02: Exposing credentials
          pass: process.env.EMAIL_PASS || 'password123' // A02: Exposing credentials
        }
      },
      apiKeys: {
        google: process.env.GOOGLE_API_KEY || 'AIzaSyDxXcH8o1tnqQbzzzzzzzzzzzzzzzzzzz',
        stripe: process.env.STRIPE_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxx'
      }
    };
    
    res.json(config);
  } catch (error) {
    logger.error(`Error fetching config: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve configuration' });
  }
});

/**
 * @route POST /api/config
 * @desc Update application configuration
 * @access Private (Admin only)
 */
router.post('/', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const configPath = path.join(__dirname, '../../uploads/config.json');
    const config = req.body;
    
    // A05: Security Misconfiguration - allowing dangerous config changes
    // A08: Software and Data Integrity Failures - no validation of config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    logger.info(`Configuration updated by ${req.user.username}`);
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    logger.error(`Error updating config: ${error.message}`);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

/**
 * @route GET /api/config/env
 * @desc Get environment variables
 * @access Private (Admin only)
 */
router.get('/env', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // A02: Exposing environment variables
    // A05: Security Misconfiguration
    const env = process.env;
    res.json(env);
  } catch (error) {
    logger.error(`Error fetching environment variables: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve environment variables' });
  }
});

/**
 * @route POST /api/config/backup
 * @desc Create a backup of the configuration
 * @access Private (Admin only)
 */
router.post('/backup', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const configPath = path.join(__dirname, '../../uploads/config.json');
    const backupPath = path.join(__dirname, '../../uploads', `config_backup_${Date.now()}.json`);
    
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'Configuration file not found' });
    }
    
    // Create backup
    fs.copyFileSync(configPath, backupPath);
    
    res.json({ 
      success: true, 
      message: 'Configuration backup created',
      backupPath: backupPath
    });
  } catch (error) {
    logger.error(`Error creating config backup: ${error.message}`);
    res.status(500).json({ error: 'Failed to create configuration backup' });
  }
});

module.exports = router;