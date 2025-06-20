const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { getIpAddress } = require('../utils/helpers');

/**
 * Middleware to authenticate JSON Web Token
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

module.exports = {
  auth,
  admin,
  apiKey
};

