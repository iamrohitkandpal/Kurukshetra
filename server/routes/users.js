const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');
const crypto = require('crypto');

// A01:2021 - Broken Access Control: No user ID verification
router.get('/profile', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    // A01:2021 - IDOR: Profile ID from query parameter without verification
    const userId = req.query.id || req.user.userId;
    const user = await db.models.User.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // A02:2021 - Cryptographic Failures: Sensitive data exposure
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      apiKey: user.apiKey,
      personalData: user.personalData,
      securityQuestions: user.securityQuestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A07:2021 - Authentication Failures: Weak API key generation
router.post('/api-key', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const apiKey = Math.random().toString(36).substring(7);
    
    await db.models.User.update(
      { apiKey },
      { where: { id: req.user.userId } }
    );
    
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api-key', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    await db.models.User.update(
      { apiKey: null },
      { where: { id: req.user.userId } }
    );
    
    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: Mass Assignment vulnerability
router.put('/profile', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const user = await db.models.User.findOne({ 
      where: { id: req.user.userId } 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // A01:2021 - Broken Access Control: No role change protection
    await user.update(req.body);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;