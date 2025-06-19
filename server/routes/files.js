const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const db = require('../config/db');
const logger = require('../utils/logger');

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.file;
    const userId = req.user.userId;
    const dbType = req.dbType;
    
    // A03: Path traversal vulnerability - no validation on file path
    
    if (dbType === 'mongodb') {
      // MongoDB - Insert file details
      const mongoose = require('mongoose');
      const FileSchema = new mongoose.Schema({
        user_id: mongoose.Schema.Types.ObjectId,
        filename: String,
        original_name: String,
        path: String,
        mimetype: String,
        size: Number,
        uploaded_at: {
          type: Date,
          default: Date.now
        }
      });
      
      const File = mongoose.model('File', FileSchema);
      
      await File.create({
        user_id: userId,
        filename: file.filename,
        original_name: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      });
    } else {
      // SQLite - Insert file details
      // A03: SQL Injection vulnerability
      await db.run(`
        INSERT INTO files (user_id, filename, original_name, path, mimetype, size)
        VALUES (${userId}, '${file.filename}', '${file.originalname}', '${file.path}', '${file.mimetype}', ${file.size})
      `);
    }
    
    logger.info(`File uploaded: ${file.filename} by user ${userId}`);
    
    return res.status(201).json({
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      message: 'File uploaded successfully'
    });
  } catch (err) {
    logger.error('File upload error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/files
// @desc    Get all files for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const dbType = req.dbType;

    if (dbType === 'mongodb') {
      // MongoDB
      const mongoose = require('mongoose');
      const File = mongoose.model('File');
      
      const files = await File.find({ user_id: userId }).sort({ uploaded_at: -1 });
      return res.json(files);
    } else {
      // SQLite
      // A03: SQL Injection vulnerability if userId is manipulated
      const files = await db.all(`
        SELECT * FROM files 
        WHERE user_id = ${userId}
        ORDER BY uploaded_at DESC
      `);
      
      return res.json(files);
    }
  } catch (err) {
    logger.error('Error fetching files:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/files/:filename
// @desc    Download a file by filename
// @access  Public - A03: Path Traversal vulnerability
router.get('/:filename', async (req, res) => {
  try {
    // A03: Path Traversal vulnerability - allowing directory traversal
    const filename = req.params.filename;
    
    // A03: Path Traversal vulnerability - no path validation
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // A03: No validation if user is authorized to access this file
    // A03: No MIME type validation to prevent serving malicious content
    
    return res.sendFile(filePath);
  } catch (err) {
    logger.error('File download error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const dbType = req.dbType;
    
    // Get file details first
    let file;
    
    if (dbType === 'mongodb') {
      // MongoDB
      const mongoose = require('mongoose');
      const File = mongoose.model('File');
      
      file = await File.findOne({ _id: id, user_id: userId });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // A03: Path Traversal vulnerability - file could be anywhere
      const filePath = file.path;
      
      // Delete file from filesystem
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from database
      await File.deleteOne({ _id: id });
    } else {
      // SQLite
      // A03: SQL Injection vulnerability
      file = await db.get(`
        SELECT * FROM files
        WHERE id = ${id} AND user_id = ${userId}
      `);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // A03: Path Traversal vulnerability - file could be anywhere
      const filePath = file.path;
      
      // Delete file from filesystem
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from database
      await db.run(`DELETE FROM files WHERE id = ${id}`);
    }
    
    return res.json({ message: 'File deleted successfully' });
  } catch (err) {
    logger.error('File deletion error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;