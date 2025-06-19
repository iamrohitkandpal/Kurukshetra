// server/routes/dbSwitch.js
const express = require('express');
const router = express.Router();
const { switchDbType, getCurrentDbType } = require('../config/dbManager');
const logger = require('../utils/logger');

/**
 * @route   POST /api/db/switch
 * @desc    Switch database type
 * @access  Public
 */
router.post('/switch', async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || !['sqlite', 'mongodb'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid database type. Must be "sqlite" or "mongodb".' 
      });
    }
    
    const result = await switchDbType(type);
    
    // Get available vulnerabilities for the selected DB type
    const vulnerabilities = getVulnerabilitiesByType(type);
    
    return res.json({
      success: true,
      message: `Database switched to ${type}`,
      vulnerabilities
    });
  } catch (error) {
    logger.error('Error switching database:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to switch database' 
    });
  }
});

/**
 * @route   GET /api/db/type
 * @desc    Get current database type
 * @access  Public
 */
router.get('/type', (req, res) => {
  const dbType = getCurrentDbType();
  res.json({ type: dbType });
});

/**
 * @route   GET /api/db/vulnerabilities
 * @desc    Get vulnerabilities for a specific database type
 * @access  Public
 */
router.get('/vulnerabilities', (req, res) => {
  const { type } = req.query;
  const vulnerabilities = getVulnerabilitiesByType(type || getCurrentDbType());
  
  res.json({ vulnerabilities });
});

/**
 * Helper function to get the list of vulnerabilities for each database type
 */
function getVulnerabilitiesByType(type) {
  const vulnerabilities = {
    sqlite: [
      'SQL Injection in login form',
      'SQL Injection in products search',
      'SQL Injection in user profile',
      'SQL Injection in admin panel'
    ],
    mongodb: [
      'NoSQL Injection in login form',
      'NoSQL Operator Injection in search',
      'NoSQL Injection in user finder',
      'NoSQL Projection Injection'
    ]
  };
  
  return vulnerabilities[type] || [];
}

module.exports = router;