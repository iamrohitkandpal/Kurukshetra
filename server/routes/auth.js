const express = require('express');
const router = express.Router();
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// A02: Cryptographic Failures - Weak JWT secret and algorithm
const JWT_SECRET = 'insecure_jwt_secret'; // Intentionally weak and hardcoded

// Register new user
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // A03: Injection vulnerability - No input validation or parameterized queries
  const query = `INSERT INTO users (username, email, password) 
                 VALUES ('${username}', '${email}', '${md5(password)}')`;
  
  db.run(query, function(err) {
    if (err) {
      // A09: Security Logging - Error details exposed to user
      return res.status(400).json({ error: err.message });
    }
    
    res.status(201).json({
      message: 'User registered',
      userId: this.lastID
    });
  });
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // A03: SQL Injection vulnerability (intentional)
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${md5(password)}'`;
  
  db.get(query, (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // A07: Identification and Authentication Failures
    // Token with weak algorithm and includes sensitive data
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '24h' }
    );
    
    // A02: Cryptographic Failures - Setting sensitive data in cookies insecurely
    res.cookie('token', token, {
      httpOnly: false, // A02: Not protecting from XSS 
      secure: false    // A02: Not protecting with HTTPS
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        apiKey: user.api_key // A02: Leaking sensitive info in response
      }
    });
  });
});

// Password reset - A07: Weak authentication and account recovery
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  
  // A04: Insecure Design - No validation or rate limiting
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!user) {
      // A07: Username enumeration vulnerability
      return res.status(400).json({ error: 'No account with that email' });
    }
    
    // A07: Authentication Failure - No actual verification, password automatically reset
    const newPassword = 'reset123';
    
    db.run(
      'UPDATE users SET password = ? WHERE email = ?', 
      [md5(newPassword), email], 
      (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        // A09: Logging and Monitoring Failures - No security logging of sensitive operation
        res.json({ 
          message: 'Password reset successfully',
          newPassword // A07: Sending password in plaintext response
        });
      }
    );
  });
});

// A01: Broken Access Control - Logout route that doesn't invalidate session
router.post('/logout', (req, res) => {
  // Only clears cookie but doesn't invalidate token on server side
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

module.exports = router;
