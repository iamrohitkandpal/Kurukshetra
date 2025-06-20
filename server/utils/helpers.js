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
  const secret = process.env.JWT_SECRET || 'kurukshetra_jwt_secret';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Hash a password using SHA256 (intentionally weak)
 * @param {string} password
 * @returns {string}
 */
const hashPassword = async (password) => {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
};

/**
 * Verify a password against a hash
 * @param {string} password
 * @param {string} hash
 * @returns {boolean}
 */
const verifyPassword = (password, hash) => {
  const calculatedHash = crypto.createHash('sha256').update(password).digest('hex');
  return calculatedHash === hash;
};

/**
 * Sanitize a filename to prevent path traversal
 * @param {string} filename
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  return path.basename(filename);
};

/**
 * Incomplete SQL sanitization
 * @param {string} input
 * @returns {string}
 */
const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
};

/**
 * Check if file exists
 * @param {string} filePath
 * @returns {boolean}
 */
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (_) {
    return false;
  }
};

/**
 * Incomplete XSS input sanitization
 * @param {string} input
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (!input) return input;
  return input.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate if a string is a valid URL
 * @param {string} url
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Convert object to query string
 * @param {Object} obj
 * @returns {string}
 */
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Get DB type from request (sqlite or mongodb)
 */
const getDbTypeFromRequest = (req) => {
  return req.query.db || req.body.db || process.env.DB_TYPE || 'sqlite';
};

/**
 * Get IP address from request
 * @param {*} req
 * @returns {string}
 */
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
};

/**
 * Check required environment variables
 * @param {string[]} required
 * @returns {boolean}
 */
const checkEnv = (required = []) => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return true;
};

/**
 * Generate secure random string
 * @param {number} length
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Weak MD5 hash (intentionally insecure)
 * @param {string} data
 * @returns {string}
 */
const insecureHash = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Weak AES-128-ECB encryption (intentionally insecure)
 * @param {string} data
 * @param {string} key
 * @returns {string}
 */
const weakEncrypt = (data, key = 'default_key') => {
  const cipher = crypto.createCipheriv(
    'aes-128-ecb',
    Buffer.from(key.padEnd(16, ' ')).slice(0, 16),
    ''
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Weak AES-128-ECB decryption (intentionally insecure)
 * @param {string} encrypted
 * @param {string} key
 * @returns {string}
 */
const weakDecrypt = (encrypted, key = 'default_key') => {
  const decipher = crypto.createDecipheriv(
    'aes-128-ecb',
    Buffer.from(key.padEnd(16, ' ')).slice(0, 16),
    ''
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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
  sanitizeInput,
  isValidUrl,
  objectToQueryString,
  getDbTypeFromRequest,
  getIpAddress,
  generateRandomString,
  insecureHash,
  weakEncrypt,
  weakDecrypt
};