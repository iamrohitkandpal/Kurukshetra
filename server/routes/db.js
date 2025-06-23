const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// Get current database type
router.get('/type', (req, res) => {
  res.json({ type: process.env.DB_TYPE || 'sqlite' });
});

// Switch database type
router.post('/switch', auth, async (req, res) => {
  const { type } = req.body;
  
  if (!['mongodb', 'sqlite'].includes(type)) {
    return res.status(400).json({ error: 'Invalid database type' });
  }

  try {
    process.env.DB_TYPE = type;
    const result = await dbManager.switchDatabase(type);
    
    res.json({ 
      success: true, 
      type: result.type,
      vulnerabilities: [
        type === 'mongodb' ? 'NoSQL Injection' : 'SQL Injection',
        'Sensitive Data Exposure',
        'Insecure Direct Object References'
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;