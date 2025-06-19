const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const auth = require('../middleware/auth');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const logger = require('../utils/logger');
const User = require('../models/mongo/User');

/**
 * @route   POST /api/mfa/setup
 * @desc    Set up MFA
 * @access  Private
 */
router.post('/setup', auth, async (req, res) => {
  try {
    const { dbType } = req;
    const userId = req.user.id;

    // A07: Weak implementation - using MD5 for token
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Kurukshetra:${req.user.username}`
    });

    if (dbType === 'mongodb') {
      // Store temporary secret until verified
      await User.findByIdAndUpdate(userId, {
        $set: { tempMfaSecret: secret.base32 }
      });
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      await db.run(`
        UPDATE users 
        SET temp_mfa_secret = '${secret.base32}'
        WHERE id = ${userId}
      `);
    }

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return res.json({
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/mfa/verify
 * @desc    Verify and enable MFA
 * @access  Private
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const { dbType } = req;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Please provide token' });
    }

    let tempSecret;

    if (dbType === 'mongodb') {
      const user = await User.findById(userId);
      tempSecret = user.tempMfaSecret;
      
      if (!tempSecret) {
        return res.status(400).json({ error: 'MFA setup not initiated' });
      }
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      const user = await db.get(`
        SELECT temp_mfa_secret 
        FROM users 
        WHERE id = ${userId}
      `);
      
      if (!user || !user.temp_mfa_secret) {
        return res.status(400).json({ error: 'MFA setup not initiated' });
      }
      
      tempSecret = user.temp_mfa_secret;
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token,
      window: 1 // More secure would be 0, this allows 1 step before/after
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (dbType === 'mongodb') {
      await User.findByIdAndUpdate(userId, {
        $set: { mfaSecret: tempSecret },
        $unset: { tempMfaSecret: 1 }
      });
    } else {
      const db = getDb();
      
      await db.run(`
        UPDATE users 
        SET mfa_secret = temp_mfa_secret, temp_mfa_secret = NULL
        WHERE id = ${userId}
      `);
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post('/disable', auth, async (req, res) => {
  try {
    const { dbType } = req;
    const userId = req.user.id;

    if (dbType === 'mongodb') {
      await User.findByIdAndUpdate(userId, {
        $unset: { mfaSecret: 1, tempMfaSecret: 1 }
      });
    } else {
      const db = getDb();
      
      await db.run(`
        UPDATE users 
        SET mfa_secret = NULL, temp_mfa_secret = NULL
        WHERE id = ${userId}
      `);
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/mfa/login
 * @desc    Login with MFA
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const { dbType } = req;

    if (!userId || !token) {
      return res.status(400).json({ error: 'Please provide userId and token' });
    }

    let user;
    let mfaSecret;

    if (dbType === 'mongodb') {
      user = await User.findById(userId);
      
      if (!user || !user.mfaSecret) {
        return res.status(400).json({ error: 'MFA not enabled for this user' });
      }
      
      mfaSecret = user.mfaSecret;
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      user = await db.get(`
        SELECT id, username, role, mfa_secret
        FROM users 
        WHERE id = ${userId}
      `);
      
      if (!user || !user.mfa_secret) {
        return res.status(400).json({ error: 'MFA not enabled for this user' });
      }
      
      mfaSecret = user.mfa_secret;
    }

    // A07: Insecure authentication - No rate limiting on MFA attempts
    const verified = speakeasy.totp.verify({
      secret: mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // A07: Missing regeneration of session token after MFA
    return res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
