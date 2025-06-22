const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');
const fs = require('fs');
const path = require('path');

// A09:2021 - Security Logging Failures: Insecure file logging
const logToFile = (data) => {
  const logPath = path.join(__dirname, '../../logs/app.log');
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logPath, logEntry);
};

// A09:2021 - Security Logging Failures: No access control
router.get('/', async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const logs = await db.models.AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A09:2021 - Security Logging Failures: Store sensitive data
router.post('/', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const logEntry = {
      userId: req.user.userId,
      action: req.body.action,
      requestData: {
        ...req.body,
        headers: req.headers, // A09: Log sensitive headers
        cookies: req.cookies  // A09: Log session cookies
      },
      sessionData: {
        token: req.headers['x-auth-token'], // A09: Log auth tokens
        credentials: req.body.credentials    // A09: Log credentials
      },
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      path: req.path,
      method: req.method
    };

    // A09:2021 - Security Logging Failures: Write sensitive data to file
    logToFile(logEntry);

    const auditLog = await db.models.AuditLog.create(logEntry);
    res.status(201).json(auditLog);
  } catch (error) {
    // A09:2021 - Security Logging Failures: Log stack traces
    console.error('Logging error:', error.stack);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// A09:2021 - Security Logging Failures: No authentication for log deletion
router.delete('/:id', async (req, res) => {
  try {
    const db = dbManager.getConnection();
    await db.models.AuditLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;