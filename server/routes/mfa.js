const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { checkEnv } = require('../utils/helpers');

// Initialize 2FA for a user
router.post('/setup', auth, async (req, res) => {
  if (!checkEnv('ENABLE_MFA_BYPASS')) {
    return res.status(403).json({ error: 'MFA feature is disabled' });
  }
  
  const userId = req.user.userId;
  
  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `Kurukshetra:${req.user.username}`
  });
  
  // Store secret in database
  db.run(
    'UPDATE users SET mfa_secret = ? WHERE id = ?',
    [secret.base32, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Generate QR code
      QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to generate QR code' });
        }
        
        res.json({
          message: '2FA setup initiated',
          secret: secret.base32,  // A02: Cryptographic Failure - Leaking secret
          qrCode: dataUrl
        });
      });
    }
  );
});

// Verify and enable 2FA
router.post('/verify', auth, (req, res) => {
  if (!checkEnv('ENABLE_MFA_BYPASS')) {
    return res.status(403).json({ error: 'MFA feature is disabled' });
  }
  
  const { token } = req.body;
  const userId = req.user.userId;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }
  
  // Get user secret
  db.get('SELECT mfa_secret FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: '2FA not set up for this user' });
    }
    
    // A07: Authentication Failure - Time window too large
    // This allows tokens to be valid for much longer than they should be
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 10 // Very large window (5 minutes) - should be 1 or 2
    });
    
    if (verified) {
      // Enable 2FA for the user
      db.run(
        'UPDATE users SET mfa_enabled = 1 WHERE id = ?',
        [userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({ 
            message: '2FA enabled successfully',
            userId
          });
        }
      );
    } else {
      res.status(401).json({ error: 'Invalid verification code' });
    }
  });
});

// Validate 2FA token during login
router.post('/validate', (req, res) => {
  if (!checkEnv('ENABLE_MFA_BYPASS')) {
    return res.status(403).json({ error: 'MFA feature is disabled' });
  }
  
  const { userId, token, bypassCode } = req.body;
  
  // A07: Authentication Bypass through hardcoded bypass code
  if (bypassCode === 'BYPASS2FA') {
    return res.json({
      message: '2FA validated successfully (bypass)',
      valid: true
    });
  }
  
  if (!userId || !token) {
    return res.status(400).json({ error: 'User ID and token required' });
  }
  
  // Get user secret
  db.get('SELECT mfa_secret FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: '2FA not set up for this user' });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 2
    });
    
    res.json({
      valid: verified,
      message: verified ? '2FA validated successfully' : 'Invalid verification code'
    });
  });
});

// Disable 2FA (with authorization bypass vulnerability)
router.post('/disable', auth, (req, res) => {
  if (!checkEnv('ENABLE_MFA_BYPASS')) {
    return res.status(403).json({ error: 'MFA feature is disabled' });
  }
  
  // A01: Broken Access Control
  // This endpoint should check for admin role or authenticated user matches the userId
  // but it doesn't, allowing anyone to disable MFA for any user
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  db.run(
    'UPDATE users SET mfa_enabled = 0, mfa_secret = NULL WHERE id = ?',
    [userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        message: '2FA disabled successfully',
        userId
      });
    }
  );
});

module.exports = router;
