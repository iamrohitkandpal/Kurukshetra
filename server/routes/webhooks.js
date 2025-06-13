const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');
const fetch = require('node-fetch');
const { checkEnv } = require('../utils/helpers');

// Create a new webhook
router.post('/', auth, (req, res) => {
  if (!checkEnv('ENABLE_WEBHOOKS')) {
    return res.status(403).json({ error: 'Webhooks feature is disabled' });
  }
  
  const { name, url, events, secret } = req.body;
  const userId = req.user.userId;
  
  if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'Name, URL and at least one event are required' });
  }
  
  // Create webhooks table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT NOT NULL,
      secret TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  
  // Save webhook
  db.run(
    `INSERT INTO webhooks (user_id, name, url, events, secret)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, name, url, JSON.stringify(events), secret],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Webhook created successfully'
      });
    }
  );
});

// Get webhooks for authenticated user
router.get('/', auth, (req, res) => {
  if (!checkEnv('ENABLE_WEBHOOKS')) {
    return res.status(403).json({ error: 'Webhooks feature is disabled' });
  }
  
  // A01: IDOR vulnerability - Admin can view all webhooks without proper filtering
  const query = req.user.role === 'admin'
    ? 'SELECT * FROM webhooks'
    : 'SELECT * FROM webhooks WHERE user_id = ?';
  
  const params = req.user.role === 'admin' ? [] : [req.user.userId];
  
  db.all(query, params, (err, webhooks) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Process webhooks to parse events
    const processedWebhooks = webhooks.map(webhook => {
      try {
        webhook.events = JSON.parse(webhook.events);
      } catch (e) {
        webhook.events = [];
      }
      return webhook;
    });
    
    res.json(processedWebhooks);
  });
});

// Test a webhook - A10: SSRF vulnerability
router.post('/test/:id', auth, async (req, res) => {
  if (!checkEnv('ENABLE_WEBHOOKS')) {
    return res.status(403).json({ error: 'Webhooks feature is disabled' });
  }
  
  const { id } = req.params;
  const { payload } = req.body;
  
  db.get('SELECT * FROM webhooks WHERE id = ?', [id], async (err, webhook) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // A01: IDOR - No check if user owns the webhook
    
    try {
      // A10: SSRF vulnerability - No URL validation
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': webhook.secret || 'nosecret'
        },
        body: JSON.stringify(payload || {
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'This is a test webhook' }
        })
      });
      
      const responseData = await response.text();
      
      res.json({
        message: 'Webhook tested successfully',
        statusCode: response.status,
        response: responseData
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to send webhook',
        details: error.message
      });
    }
  });
});

// Delete webhook
router.delete('/:id', auth, (req, res) => {
  if (!checkEnv('ENABLE_WEBHOOKS')) {
    return res.status(403).json({ error: 'Webhooks feature is disabled' });
  }
  
  const { id } = req.params;
  
  // A01: IDOR - No verification if user owns the webhook
  db.run('DELETE FROM webhooks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    res.json({ message: 'Webhook deleted successfully' });
  });
});

// Handle incoming webhook for SSRF testing (simulate internal service)
router.post('/internal-service', (req, res) => {
  // This endpoint simulates an internal service that should not be accessible externally
  // A attacker can use SSRF to access this from the external webhook testing feature
  
  res.json({
    message: 'Internal service accessed successfully',
    sensitive_data: {
      api_keys: {
        stripe: 'sk_test_123456789',
        aws: 'AKIA1234567890ABCDEF'
      },
      database: {
        host: 'internal-db.local',
        user: 'root',
        password: 'super_secret_password'
      },
      users: [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'user', role: 'user' }
      ]
    },
    environment: process.env.NODE_ENV
  });
});

// Configure a webhook - A10: SSRF Vulnerability
router.post('/configure', auth, (req, res) => {
  // A10: SSRF Vulnerability
  const { url, events } = req.body;

  if (!url || !events) {
    return res.status(400).json({ error: 'URL and events are required' });
  }

  // A10: No URL validation - SSRF vulnerability
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      events,
      test: true,
      timestamp: new Date().toISOString()
    })
  })
  .then(response => response.json())
  .then(data => {
    res.json({
      message: 'Webhook configured successfully',
      webhookUrl: url,
      events,
      testResponse: data
    });
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
});

module.exports = router;
