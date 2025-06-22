const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// Platform feature: Database switching endpoint
router.post('/switch', auth, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['sqlite', 'mongodb'].includes(type)) {
      return res.status(400).json({ error: 'Invalid database type' });
    }

    const result = await dbManager.switchDatabase(type);
    
    // Return available injection vulnerabilities based on DB type
    const vulnerabilities = type === 'mongodb' 
      ? ['NoSQL Injection in User Search', 'NoSQL Injection in Products', 'NoSQL Object Injection']
      : ['SQL Injection in Login', 'Union-based SQL Injection', 'Error-based SQL Injection'];

    res.json({ 
      success: true, 
      type: result.type,
      vulnerabilities
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get current database status
router.get('/status', auth, (req, res) => {
  const currentDb = dbManager.getCurrentDb();
  res.json({ type: currentDb });
});

module.exports = router;