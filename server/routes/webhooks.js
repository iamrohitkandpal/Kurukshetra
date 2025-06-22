const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// A10:2021 - SSRF: Create webhook without URL validation
router.post('/', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { name, url, events, secret } = req.body;
    
    const webhook = await db.models.Webhook.create({
      name,
      url,
      events,
      secret,
      userId: req.user.userId
    });

    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A10:2021 - SSRF: Test webhook with any URL
router.post('/test/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const webhook = await db.models.Webhook.findByPk(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // A10:2021 - SSRF: No URL validation or restrictions
    const response = await axios.post(webhook.url, {
      event: 'test',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-Webhook-Secret': webhook.secret
      },
      // A10:2021 - SSRF: Allow private/local network access
      proxy: false,
      timeout: 5000
    });

    // A04:2021 - Insecure Design: Store response data
    await webhook.update({ lastResponse: response.data });

    res.json({ 
      status: 'success',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: No ownership check
router.get('/', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const webhooks = await db.models.Webhook.findAll();
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: Delete without verification
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    await db.models.Webhook.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;