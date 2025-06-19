const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const auth = require('../middleware/auth');
const { generateToken } = require('../utils/helpers');
const User = require('../models/mongo/User');
const logger = require('../utils/logger');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const { dbType } = req;

    if (dbType === 'mongodb') {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // A02: Sensitive data exposure - Returning sensitive data to client
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        apiKey: user.apiKey,
        mfaEnabled: Boolean(user.mfaSecret),
        securityQuestions: user.securityQuestions
      });
    } else {
      // SQLite version
      const db = getDb();
      
      // A01: IDOR vulnerability - No validation if the requested profile belongs to the user
      const userId = req.query.id || req.user.id;
      
      // A03: SQL Injection vulnerability - Using string interpolation in SQL
      const user = await db.get(`SELECT id, username, email, role, api_key, mfa_secret, security_questions FROM users WHERE id = ${userId}`);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        apiKey: user.api_key,
        mfaEnabled: Boolean(user.mfa_secret),
        securityQuestions: user.security_questions ? JSON.parse(user.security_questions) : []
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const { dbType } = req;

    if (dbType === 'mongodb') {
      // A01: IDOR vulnerability - Missing validation of user ID
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { email } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability - Using string interpolation
      await db.run(`UPDATE users SET email = '${email}' WHERE id = ${req.user.id}`);
      
      const user = await db.get(`SELECT id, username, email, role FROM users WHERE id = ${req.user.id}`);
      
      return res.json(user);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/users/personal-data
 * @desc    Get user sensitive personal data
 * @access  Private
 */
router.get('/personal-data', auth, async (req, res) => {
  try {
    const { dbType } = req;

    // A02: Sensitive data exposure - Returning PII data without encryption
    if (dbType === 'mongodb') {
      const user = await User.findById(req.user.id).select('personalData');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(user.personalData || {
        phoneNumber: '',
        ssn: '',
        dateOfBirth: '',
        address: '',
        bankAccount: '',
        nationalId: '',
        userId: user._id
      });
    } else {
      const db = getDb();
      
      const userData = await db.get(`
        SELECT personal_data, id as userId
        FROM users 
        WHERE id = ${req.user.id}
      `);
      
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      let personalData = {};
      try {
        personalData = userData.personal_data ? JSON.parse(userData.personal_data) : {};
      } catch (err) {
        logger.error('Error parsing personal data', err);
      }
      
      return res.json({
        ...personalData,
        userId: userData.userId
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/personal-data
 * @desc    Update user sensitive personal data
 * @access  Private
 */
router.put('/personal-data', auth, async (req, res) => {
  try {
    const { dbType } = req;
    
    // A02: Sensitive data exposure - Personal data stored without encryption
    if (dbType === 'mongodb') {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { personalData: req.body } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({ success: true, data: user.personalData });
    } else {
      const db = getDb();
      
      const personalData = JSON.stringify(req.body);
      
      await db.run(`
        UPDATE users 
        SET personal_data = '${personalData}' 
        WHERE id = ${req.user.id}
      `);
      
      return res.json({ success: true, data: req.body });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/users/api-key
 * @desc    Generate a new API key
 * @access  Private
 */
router.post('/api-key', auth, async (req, res) => {
  try {
    const { dbType } = req;
    const apiKey = generateToken(32);

    if (dbType === 'mongodb') {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { apiKey } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({ apiKey });
    } else {
      const db = getDb();
      
      await db.run(`
        UPDATE users 
        SET api_key = '${apiKey}' 
        WHERE id = ${req.user.id}
      `);
      
      return res.json({ apiKey });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/users/api-key
 * @desc    Revoke API key
 * @access  Private
 */
router.delete('/api-key', auth, async (req, res) => {
  try {
    const { dbType } = req;

    if (dbType === 'mongodb') {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $unset: { apiKey: 1 } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({ success: true });
    } else {
      const db = getDb();
      
      await db.run(`
        UPDATE users 
        SET api_key = NULL 
        WHERE id = ${req.user.id}
      `);
      
      return res.json({ success: true });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;