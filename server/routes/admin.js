const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// A01: Broken Access Control - Weak admin check
function isAdmin(req, res, next) {
  // Simple role check without proper verification
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}

// Get all users - A01: Broken Access Control - Vulnerable to IDOR
router.get('/users', auth, isAdmin, (req, res) => {
  db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(users);
  });
});

// Delete user - A01: Broken Access Control - Mass Assignment
router.delete('/users/:id', auth, (req, res) => {
  // Missing isAdmin middleware - intentionally vulnerable
  const { id } = req.params;
  
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

// System info endpoint - A03: Command Injection vulnerability
router.get('/system-info', auth, isAdmin, (req, res) => {
  const { command } = req.query;
  try {
    // A03: Command Injection vulnerability (intentional)
    const output = execSync(command || 'uname -a').toString();
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup database - A03: Path Traversal vulnerability
router.get('/backup', auth, isAdmin, (req, res) => {
  const { filename } = req.query;
  
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }
  
  // A03: Path Traversal vulnerability (intentional)
  const filePath = path.join(__dirname, '../../backups', filename);
  
  try {
    // A03: Creating a copy of the database without validation
    fs.copyFileSync(
      path.join(__dirname, '../../database.db'),
      filePath
    );
    
    res.json({ message: 'Backup created', path: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import configuration - A08: Software & Data Integrity Failure
// A10: SSRF vulnerability in import function
router.post('/import-config', auth, isAdmin, async (req, res) => {
  const { configUrl } = req.body;
  
  try {
    // A10: SSRF vulnerability (intentional)
    const fetch = require('node-fetch');
    const response = await fetch(configUrl);
    const config = await response.json();
    
    // A08: Software & Data Integrity Failure - No verification of imported data
    // Apply config without validation
    if (config.adminEmail) {
      db.run('UPDATE users SET email = ? WHERE role = ?', [config.adminEmail, 'admin']);
    }
    
    res.json({ message: 'Configuration imported', config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create backup - A03: Command Injection vulnerability
router.post('/backup/create', auth, isAdmin, (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  
  // A03: Command Injection vulnerability
  const cmd = `tar -czf ${backupDir}/backup-${timestamp}.tar.gz ./database.db ./uploads`;
  
  try {
    execSync(cmd);
    res.json({ 
      message: 'Backup created successfully',
      file: `backup-${timestamp}.tar.gz`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
