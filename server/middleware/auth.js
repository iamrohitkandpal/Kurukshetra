const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// A02: Cryptographic Failures - Weak JWT secret and algorithm
const JWT_SECRET = 'insecure_jwt_secret'; // Intentionally weak and hardcoded

// A01: Broken Access Control - Weak authentication implementation
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || req.cookies.token;
  
  // A07: Authentication Failures - Accepting API key as alternative with no rate limiting
  const apiKey = req.header('x-api-key');
  
  // Check for token or API key
  if (!token && !apiKey) {
    return res.status(401).json({ error: 'No token or API key, authorization denied' });
  }
  
  try {
    if (token) {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } else if (apiKey) {
      // A07: Weak API authentication - Simple lookup without rate limiting or sufficient entropy
      db.get('SELECT * FROM users WHERE api_key = ?', [apiKey], (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        req.user = {
          userId: user.id,
          username: user.username,
          role: user.role
        };
        next();
      });
    }
  } catch (err) {
    // A09: Logging Failure - Revealing sensitive error details
    res.status(401).json({ error: 'Token is not valid', details: err.message });
  }
};
