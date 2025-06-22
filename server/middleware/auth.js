const { verifyToken } = require('../config/jwt');

// A07:2021 - Authentication Failures: Weak token verification
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // A07:2021 - Authentication Failures: No token expiration check
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    // A09:2021 - Security Logging Failures: Exposing error details
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Token is not valid', details: err.message });
  }
};

// A01:2021 - Broken Access Control: Weak role verification
const admin = (req, res, next) => {
  // A01:2021 - Broken Access Control: Role check can be bypassed with header
  const isAdmin = req.user?.role === 'admin' || req.headers['x-admin-override'] === 'true';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = { auth, admin };