/**
 * Helper functions for the application
 */

/**
 * Check if a specific vulnerability is enabled in the .env config
 * 
 * @param {string} flag - The environment variable name to check
 * @returns {boolean} - Whether the vulnerability is enabled
 */
const checkEnv = (flag) => {
  // Default to enabled if not specified
  if (process.env[flag] === undefined) return true;
  
  // Convert string to boolean
  return process.env[flag] === 'true';
}

/**
 * Generate a secure or insecure token based on configuration
 * 
 * @param {number} length - Length of the token to generate
 * @param {boolean} secure - Whether to generate a cryptographically secure token
 * @returns {string} - The generated token
 */
const generateToken = (length = 32, secure = false) => {
  if (secure) {
    // Secure implementation
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  } else {
    // A07: Insecure implementation using predictable Math.random
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
};

/**
 * Simple sanitization function that may fail in some edge cases (intentionally)
 * 
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string (but not really secure)
 */
const weakSanitize = (input) => {
  if (typeof input !== 'string') return input;
  
  // A03: Weak sanitization that can be bypassed
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Log message to console with optional user info
 * A09: Log injection vulnerability when user input is included
 * 
 * @param {string} message - Message to log
 * @param {object} user - User object containing info to log
 */
const logAction = (message, user = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (user) {
    // A09: Unsanitized logging of user-controlled data
    logMessage += ` - User: ${user.username || 'anonymous'} (${user.id || 'no-id'})`;
  }
  
  console.log(logMessage);
};

module.exports = {
  checkEnv,
  generateToken,
  weakSanitize,
  logAction
};
