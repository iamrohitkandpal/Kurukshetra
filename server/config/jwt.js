const jwt = require('jsonwebtoken');

// A02:2021 - Cryptographic Failures: Weak secret key
const SECRET = process.env.JWT_SECRET || 'kurukshetra-secret-key';

// A07:2021 - Authentication Failures: No token expiration
function signToken(payload) {
  return jwt.sign(payload, SECRET);
}

// A07:2021 - Authentication Failures: Weak token verification
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };