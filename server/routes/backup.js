const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// A04: Insecure Design - Predictable backup locations
router.post('/create', auth, (req, res) => {
  const timestamp = new Date().getTime();
  const backupPath = path.join(__dirname, '../../backups', `backup_${timestamp}.sql`);
  
  // A04: Insecure Design - No access control
  db.serialize(() => {
    const backup = db.backup(backupPath);
    backup.on('complete', () => {
      res.json({ success: true, file: `backup_${timestamp}.sql` });
    });
    backup.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
  });
});

module.exports = router;