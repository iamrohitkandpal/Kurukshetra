const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { getIpAddress } = require('../utils/helpers');
const bcrypt = require('bcrypt');

/**
 * Middleware to authenticate JSON Web Token
 * A07: JWT handling without proper error checking
 */
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_insecure_secret');
    
    // Add user from payload
    req.user = decoded;
    
    // Log access
    logger.info(`Authenticated access: ${req.user.username} [${req.user.role}]`);
    
    next();
  } catch (err) {
    logger.security('Authentication failure', null, getIpAddress(req));
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * Middleware to ensure admin role
 * A01: Broken access control - insufficient checks
 */
const admin = (req, res, next) => {
  // First run auth middleware
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      logger.security('Unauthorized admin access attempt', 
        req.user ? req.user.username : null, 
        getIpAddress(req)
      );
      return res.status(403).json({ error: 'Unauthorized. Admin access required' });
    }
  });
};

/**
 * API key authentication for external requests
 * A02: Insecure cryptographic storage - API keys without rate limiting
 */
const apiKey = async (req, res, next) => {
  const key = req.header('x-api-key');
  
  if (!key) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    const dbType = req.dbType;
    let user;

    if (dbType === 'mongodb') {
      const User = require('../models/mongo/User');
      user = await User.findOne({ apiKey: key });
    } else {
      const db = require('../config/db');
      user = await db.get(`SELECT * FROM users WHERE api_key = '${key}'`);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Add user to request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (err) {
    logger.error('API key authentication error', err);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const dbType = req.dbType;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    if (dbType === 'sqlite') {
      const db = require('../config/db');
      
      // Use parameterized query with async/await
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ? OR username = ?', 
        [email, username]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Use parameterized query for insert
      await db.get(
        `INSERT INTO users (username, email, password, role, created_at) 
         VALUES (?, ?, ?, 'user', datetime('now'))`,
        [username, email, hashedPassword]
      );
      
      return res.status(201).json({ message: 'User registered successfully' });
    } else {
      // MongoDB logic...
    }
  } catch (err) {
    logger.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Keep the current export in auth.js
module.exports = {
  auth,
  admin,
  apiKey
};

