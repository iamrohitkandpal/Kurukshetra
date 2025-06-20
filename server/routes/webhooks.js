const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * @route   GET /api/webhooks
 * @desc    Get all user webhooks
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { dbType } = req;
    const userId = req.user.id;

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      const webhooks = await db.collection('webhooks')
        .find({ userId })
        .toArray();
        
      return res.json(webhooks);
    } else {
      const db = getDb();
      
      const webhooks = await db.all(
        'SELECT * FROM webhooks WHERE user_id = ?',
        [userId]
      );
      
      return res.json(webhooks.map(webhook => ({
        ...webhook,
        events: JSON.parse(webhook.events || '[]')
      })));
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/webhooks
 * @desc    Create a webhook
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, url, events, secret } = req.body;
    const { dbType } = req;
    const userId = req.user.id;

    if (!name || !url || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Please provide name, url and events' });
    }

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      const result = await db.collection('webhooks').insertOne({
        name,
        url, // A10: SSRF vulnerability - No validation of URL
        events,
        secret,
        userId,
        createdAt: new Date()
      });
      
      return res.json({
        id: result.insertedId,
        name,
        url,
        events,
        secret
      });
    } else {
      const db = getDb();
      
      const query = `
        INSERT INTO webhooks (name, url, events, secret, user_id, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;
      
      const result = await db.run(query, [
        name,
        url,
        JSON.stringify(events),
        secret || '',
        userId
      ]);
      
      return res.json({
        id: result.lastID,
        name,
        url,
        events,
        secret
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/webhooks/test/:id
 * @desc    Test a webhook
 * @access  Private
 */
router.post('/test/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;
    const { dbType } = req;
    const userId = req.user.id;

    let webhook;

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      const { ObjectId } = require('mongodb');
      
      webhook = await db.collection('webhooks').findOne({
        _id: new ObjectId(id),
        userId
      });
    } else {
      const db = getDb();
      
      webhook = await db.get(
        'SELECT * FROM webhooks WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (webhook) {
        webhook.events = JSON.parse(webhook.events || '[]');
      }
    }

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Validate URL to prevent SSRF
    const urlPattern = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
    if (!urlPattern.test(webhook.url)) {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }

    const data = {
      ...payload,
      webhook_id: id,
      timestamp: new Date().toISOString()
    };

    let headers = { 'Content-Type': 'application/json' };
    
    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(data))
        .digest('hex');
        
      headers['X-Webhook-Signature'] = signature;
    }

    await axios.post(webhook.url, data, { headers });
    return res.json({ success: true });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
