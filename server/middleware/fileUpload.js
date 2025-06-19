const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // A01: Path traversal vulnerability - allowing directory exploration
    // Get destination from request
    const customDir = req.query.directory || '';
    
    // A03: Path traversal vulnerability - no sanitization
    const targetDir = path.join(uploadDir, customDir);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch (error) {
        logger.error('Error creating upload directory:', error);
        return cb(new Error('Could not create upload directory'), null);
      }
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // A03: Path traversal/file inclusion vulnerability
    // Using the original filename could allow uploading to unintended locations
    const filename = file.originalname;
    
    cb(null, filename);
  }
});

// A06: Vulnerable and Outdated Components - No file size limit or type validation
const upload = multer({ 
  storage,
  // Deliberately omit limits to allow for DoS vulnerabilities
  // Deliberately omit fileFilter to allow any file type
});

module.exports = upload;