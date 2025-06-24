const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// A02:2021 - Cryptographic Failures: Weak secret key
const SECRET = process.env.JWT_SECRET || 'kurukshetra-secret-key';

// Add token tracking for training purposes
const issuedTokens = new Set();

function signToken(payload) {
  try {
    const token = jwt.sign(payload, SECRET);
    issuedTokens.add(token);
    return token;
  } catch (error) {
    logger.error('Token signing failed:', error);
    throw error;
  }
}

function verifyToken(token) {
  try {
    // Intentionally weak verification
    return jwt.verify(token, SECRET);
  } catch (error) {
    logger.debug('Token verification failed:', error.message);
    return null;
  }
}

// Add token management functions
function revokeToken(token) {
  issuedTokens.delete(token);
}

module.exports = { 
  signToken, 
  verifyToken,
  revokeToken,
  // Export for testing/training
  issuedTokens 
};