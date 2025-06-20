const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/backup/create
 * @desc Create a database backup
 * @access Private (Admin only)
 */
router.post('/create', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const db = req.db;
  const dbType = req.dbType || 'sqlite';
  const backupDir = path.join(__dirname, '../../data/backups');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFileName = `backup_${dbType}_${timestamp}`;
  
  // Make sure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    if (dbType === 'sqlite') {
      const dbPath = path.join(__dirname, '../../data/db.sqlite3');
      const backupPath = path.join(backupDir, `${backupFileName}.sqlite3`);
      
      // A03: Command Injection vulnerability
      // Vulnerable command construction using user-controllable data
      const command = `sqlite3 ${dbPath} .dump > ${backupPath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Backup error: ${error.message}`);
          return res.status(500).json({ error: 'Backup failed' });
        }
        
        res.json({
          success: true,
          message: 'SQLite backup created successfully',
          backupPath: backupPath
        });
      });
    } else if (dbType === 'mongodb') {
      const backupPath = path.join(backupDir, backupFileName);
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kurukshetra';
      
      // A03: Command Injection vulnerability
      // Vulnerable command construction
      let command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;
      
      // Adding optional parameters from request
      if (req.body.params) {
        command += ` ${req.body.params}`; // A03: Command injection here
      }
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Backup error: ${error.message}`);
          return res.status(500).json({ error: 'Backup failed' });
        }
        
        res.json({
          success: true,
          message: 'MongoDB backup created successfully',
          backupPath: backupPath
        });
      });
    } else {
      res.status(400).json({ error: 'Unsupported database type' });
    }
  } catch (error) {
    logger.error(`Backup error: ${error.message}`);
    res.status(500).json({ error: 'Backup failed' });
  }
});

/**
 * @route GET /api/backup/list
 * @desc List available backups
 * @access Private (Admin only)
 */
router.get('/list', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const backupDir = path.join(__dirname, '../../data/backups');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get list of backup files
    fs.readdir(backupDir, (err, files) => {
      if (err) {
        logger.error(`Error reading backup directory: ${err.message}`);
        return res.status(500).json({ error: 'Failed to list backups' });
      }
      
      const backups = files.map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          size: stats.size,
          created: stats.mtime,
          path: filePath
        };
      });
      
      res.json(backups);
    });
  } catch (error) {
    logger.error(`Error listing backups: ${error.message}`);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

/**
 * @route POST /api/backup/restore
 * @desc Restore a database backup
 * @access Private (Admin only)
 */
router.post('/restore', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { fileName } = req.body;
  const dbType = req.dbType || 'sqlite';
  const backupDir = path.join(__dirname, '../../data/backups');
  
  if (!fileName) {
    return res.status(400).json({ error: 'Backup file name is required' });
  }

  try {
    // A01: Path Traversal vulnerability
    // No validation or sanitization of fileName
    const backupPath = path.join(backupDir, fileName);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    if (dbType === 'sqlite') {
      const dbPath = path.join(__dirname, '../../data/db.sqlite3');
      
      // A03: Command Injection vulnerability
      // Vulnerable command construction
      const command = `sqlite3 ${dbPath} < ${backupPath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Restore error: ${error.message}`);
          return res.status(500).json({ error: 'Restore failed' });
        }
        
        res.json({
          success: true,
          message: 'SQLite database restored successfully'
        });
      });
    } else if (dbType === 'mongodb') {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kurukshetra';
      
      // A03: Command Injection vulnerability
      // Vulnerable command construction
      let command = `mongorestore --uri="${mongoUri}" --drop "${backupPath}"`;
      
      // Adding optional parameters from request
      if (req.body.params) {
        command += ` ${req.body.params}`; // A03: Command injection here
      }
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Restore error: ${error.message}`);
          return res.status(500).json({ error: 'Restore failed' });
        }
        
        res.json({
          success: true,
          message: 'MongoDB database restored successfully'
        });
      });
    } else {
      res.status(400).json({ error: 'Unsupported database type' });
    }
  } catch (error) {
    logger.error(`Restore error: ${error.message}`);
    res.status(500).json({ error: 'Restore failed' });
  }
});

/**
 * @route DELETE /api/backup/:fileName
 * @desc Delete a backup file
 * @access Private (Admin only)
 */
router.delete('/:fileName', auth, (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const fileName = req.params.fileName;
  const backupDir = path.join(__dirname, '../../data/backups');
  
  try {
    // A01: Path Traversal vulnerability
    // No validation or sanitization of fileName
    const filePath = path.join(backupDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting backup: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

module.exports = router;