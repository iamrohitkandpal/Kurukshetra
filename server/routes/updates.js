const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * @route   POST /api/updates/check
 * @desc    Check for software updates
 * @access  Private/Admin
 */
router.post('/check', auth, async (req, res) => {
  try {
    const { updateUrl } = req.body;
    
    if (!updateUrl) {
      return res.status(400).json({ error: 'Please provide updateUrl' });
    }
    
    // A01: Missing admin role check
    
    // A10: SSRF vulnerability - No validation of URL
    const response = await axios.get(updateUrl, {
      timeout: 5000,
      validateStatus: false // Don't throw on non-200 responses
    });
    
    return res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/updates/available
 * @desc    Check if updates are available
 * @access  Public
 */
router.get('/available', async (req, res) => {
  try {
    const { dbType } = req;
    
    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      const updates = await db.collection('updates')
        .find({ available: true })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
        
      return res.json(updates[0] || { available: false });
    } else {
      const db = getDb();
      
      const update = await db.get(`
        SELECT * FROM updates 
        WHERE available = 1
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      return res.json(update || { available: false });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/updates/import
 * @desc    Import updates from URL
 * @access  Private/Admin
 */
router.post('/import', auth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Please provide URL' });
    }
    
    // A01: Missing admin role check
    
    // A10: SSRF vulnerability - No URL validation
    const response = await axios.get(url);
    
    const { version, changelog, updateData } = response.data;
    
    if (!version || !changelog) {
      return res.status(400).json({ error: 'Invalid update data' });
    }
    
    const { dbType } = req;
    
    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      await db.collection('updates').insertOne({
        version,
        changelog,
        updateData,
        available: true,
        imported: true,
        importedAt: new Date(),
        importedBy: req.user.id
      });
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      await db.run(`
        INSERT INTO updates (version, changelog, update_data, available, imported, imported_at, imported_by)
        VALUES ('${version}', '${changelog}', '${JSON.stringify(updateData)}', 1, 1, datetime('now'), ${req.user.id})
      `);
    }
    
    return res.json({
      success: true,
      version,
      changelog
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;