const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// A05:2021 - Security Misconfiguration: Unsafe file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // A08:2021 - Software and Data Integrity Failures: No filename sanitization
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Add response wrapper
const sendFileResponse = (res, file) => {
  res.json({
    id: file.id,
    filename: file.filename,
    size: file.size,
    uploadedBy: file.uploadedBy,
    url: `/files/${file.filename}`
  });
};

// A05:2021 - Security Misconfiguration: No file type validation
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const db = dbManager.getConnection();
    const file = await db.models.File.create({
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedBy: req.user.userId
    });

    sendFileResponse(res, file);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: Path Traversal vulnerability
router.get('/:filename', auth, (req, res) => {
  // A05:2021 - Security Misconfiguration: Unsafe path joining
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);
  
  // A08:2021 - Software and Data Integrity Failures: No path validation
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const files = await db.models.File.findAll({
      where: { uploadedBy: req.user.userId }
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: No ownership verification
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const file = await db.models.File.findByPk(req.params.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // A08:2021 - Software and Data Integrity Failures: Unsafe file deletion
    fs.unlinkSync(file.path);
    await file.destroy();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;