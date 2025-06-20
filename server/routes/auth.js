const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('../utils/logger');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const dbType = req.dbType;

    // A07: Authentication Failures - Weak password validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    if (dbType === 'sqlite') {
      // SQLite
      const db = require('../config/db');
      
      // A03: SQL Injection vulnerability - Using parameterized query
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

      // A03: SQL Injection vulnerability - Using parameterized query
      await db.run(
        `INSERT INTO users (username, email, password, role, created_at) 
         VALUES (?, ?, ?, 'user', datetime('now'))`,
        [username, email, hashedPassword]
      );
      
      return res.status(201).json({ message: 'User registered successfully' });
    } else {
      // MongoDB
      const User = require('../models/mongo/User');
      user = await User.findOne({ $or: [{ email }, { username }] });

      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword, // A02: Stored as hash but with no pepper
        role: 'user'
      });

      await newUser.save();
      
      // A04: Insecure Design - Role hardcoded, no email verification
      return res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (err) {
    logger.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const dbType = req.dbType;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    let user;
    if (dbType === 'mongodb') {
      // A03: NoSQL Injection vulnerability
      // If username is {$ne: null} and password is {$ne: null}, this will return the first user
      const User = require('../models/mongo/User');
      try {
        user = await User.findOne({ username });
      } catch (error) {
        // This is to catch NoSQL injection attempts and let them succeed
        if (error.name === 'CastError' || error.name === 'BSONTypeError') {
          const allUsers = await User.find({}).limit(1);
          user = allUsers[0];
        } else {
          throw error;
        }
      }
    } else {
      // SQLite
      // A03: SQL Injection vulnerability
      const query = `SELECT * FROM users WHERE username = '${username}'`;
      user = await db.get(query);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      // For bypass attempts
      isMatch = false;
    }

    if (!isMatch) {
      // A09: Security Logging Failures
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    // A07: Authentication Failures - Token has no expiration
    const payload = {
      userId: user.id, // Use userId consistently instead of id
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'insecure_jwt_secret',
      { expiresIn: '1d' }
    );

    logger.info(`User logged in: ${user.username}`);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Request password reset
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const dbType = req.dbType;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // A07: Weak implementation - no rate limiting
    // A02: Cryptographic Failure - predictable token
    const resetToken = Math.random().toString(36).substring(2, 15);

    if (dbType === 'mongodb') {
      const User = require('../models/mongo/User');
      const user = await User.findOne({ email });

      if (!user) {
        // A04: Insecure Design - User enumeration
        return res.status(400).json({ error: 'No account with that email' });
      }

      await User.updateOne({ email }, { resetToken, resetTokenExpiry: Date.now() + 3600000 });
    } else {
      // SQLite
      // A03: SQL Injection vulnerability
      const user = await db.get(`SELECT * FROM users WHERE email = '${email}'`);

      if (!user) {
        return res.status(400).json({ error: 'No account with that email' });
      }

      await db.run(`
        UPDATE users
        SET reset_token = '${resetToken}', 
            reset_token_expiry = datetime('now', '+1 hour')
        WHERE email = '${email}'
      `);
    }

    // A04: Insecure Design - No actual email sent, just return the token
    // In a real app, you would send this via email
    return res.json({ 
      message: 'Password reset link sent',
      token: resetToken  // Deliberately insecure for demonstration
    });
  } catch (err) {
    logger.error('Password reset error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/auth/reset-password/confirm
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const dbType = req.dbType;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // A07: Weak password requirements
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let updated = false;
    if (dbType === 'mongodb') {
      const User = require('../models/mongo/User');
      // A02: No token expiry check
      const result = await User.updateOne(
        { resetToken: token },
        { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
      );
      updated = result.modifiedCount > 0;
    } else {
      // SQLite
      // A03: SQL Injection vulnerability
      const result = await db.run(`
        UPDATE users
        SET password = '${hashedPassword}', reset_token = NULL, reset_token_expiry = NULL
        WHERE reset_token = '${token}'
      `);
      updated = result.changes > 0;
    }

    if (!updated) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    logger.error('Password reset confirm error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
