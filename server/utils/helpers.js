/**
 * Helper functions for the application
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * Generate a random token
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT token
 */
const generateJwtToken = (payload, expiresIn = '1h') => {
  // A07: Using weak secret key
  const secret = process.env.JWT_SECRET || 'kurukshetra_jwt_secret';
  
  // A07: Not including proper token claims (such as iat, nbf)
  return jwt.sign(
    payload,
    secret,
    { expiresIn }
  );
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Password to hash
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  // A02: Weak cryptographic implementation
  // Should be using bcrypt with proper salt rounds
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
};

/**
 * Verify a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Password hash
 * @returns {boolean} - Whether the password matches
 */
const verifyPassword = (password, hash) => {
  // A02: Weak cryptographic implementation
  // Should be using bcrypt.compare
  const calculatedHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
  
  return calculatedHash === hash;
};

/**
 * Sanitize a filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // A03: Incomplete sanitization - still vulnerable to specific attacks
  return path.basename(filename);
};

/**
 * Sanitize SQL input to prevent injection
 * @param {string} input - SQL input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeSQL = (input) => {
  // A03: Incomplete SQL sanitization - still vulnerable to certain attacks
  // This is intentional for the training application
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\');
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} - Whether the file exists
 */
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

/**
 * Generate a random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Sanitize input (intentionally incomplete for XSS vulnerabilities)
 */
const sanitizeInput = (input) => {
  if (!input) return input;
  
  // A03: This sanitization is incomplete, allowing XSS attacks
  // Only removes basic script tags but not event handlers or other vectors
  return input.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate if a string is a valid URL
 * A10: SSRF - This validation is insufficient
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert object to query string
 */
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Get database type from request
 */
const getDbTypeFromRequest = (req) => {
  return req.query.db || req.body.db || process.env.DB_TYPE || 'sqlite';
};

/**
 * Get client IP address
 */
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         'unknown';
};

// Add this to helpers.js before the exports
const checkEnv = (required = []) => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return true;
};

module.exports = {
  checkEnv,
  generateRandomToken,
  generateJwtToken,
  hashPassword,
  verifyPassword,
  sanitizeFilename,
  sanitizeSQL,
  fileExists,
  generateToken,
  sanitizeInput,
  isValidUrl,
  objectToQueryString,
  getDbTypeFromRequest,
  getIpAddress
};
const insecureHash = (data) => {
  // A02: Using MD5, which is cryptographically broken - intentionally vulnerable
  return crypto.createHash('md5').update(data).digest('hex');
};

// A02: Weak encryption - intentionally vulnerable
const weakEncrypt = (data, key = 'default_key') => {
  // A02: Using a weak cipher and static IV - intentionally vulnerable
  const cipher = crypto.createCipheriv(
    'aes-128-ecb',
    Buffer.from(key.padEnd(16, ' ')).slice(0, 16),
    '' // ECB mode doesn't use an IV
  );
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// A02: Weak decryption - intentionally vulnerable
const weakDecrypt = (encrypted, key = 'default_key') => {
  // A02: Using a weak cipher and static IV - intentionally vulnerable
  const decipher = crypto.createDecipheriv(
    'aes-128-ecb',
    Buffer.from(key.padEnd(16, ' ')).slice(0, 16),
    '' // ECB mode doesn't use an IV
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  checkEnv,
  generateToken,
  generateJwtToken,
  generateRandomString,
  weakSanitize,
  logAction,
  insecureHash,
  weakEncrypt,
  weakDecrypt
};
