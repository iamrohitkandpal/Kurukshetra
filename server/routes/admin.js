const express = require('express');
const router = express.Router();
const { admin } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// A01:2021 - Broken Access Control: No rate limiting or brute force protection
router.get('/users', admin, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const users = await db.models.User.findAll();
    // A03:2021 - Injection: Returning sensitive data
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: No resource-based authorization
router.delete('/users/:id', admin, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    await db.models.User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A08:2021 - Software and Data Integrity Failures: Dangerous RCE via system commands
router.get('/system-info', admin, async (req, res) => {
  const { exec } = require('child_process');
  // A03:2021 - Injection: Direct command injection vulnerability
  const command = req.query.command || 'uname -a';
  
  // A08:2021 - Software and Data Integrity Failures: Unsafe command execution
  exec(command, { shell: true }, (error, stdout, stderr) => {
    // A09:2021 - Security Logging Failures: Log sensitive system info
    console.log(`Executed command: ${command}`);
    console.log(`User: ${req.user.username}`);

    if (error) {
      // A05:2021 - Security Misconfiguration: Return detailed error
      res.status(500).json({ 
        error: error.message,
        command,
        stderr,
        code: error.code
      });
      return;
    }

    // A05:2021 - Security Misconfiguration: Return sensitive system data
    res.json({
      output: stdout,
      command,
      user: process.env.USER || process.env.USERNAME,
      path: process.env.PATH,
      env: process.env
    });
  });
});

// A09:2021 - Security Logging Failures: Expose sensitive logs
router.get('/system/stats', admin, async (req, res) => {
  try {
    const stats = {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      env: process.env // Intentionally expose env vars
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A09:2021 - Security Logging Failures: Expose detailed logs
router.get('/logs', admin, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const logs = await db.models.AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;