const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../client/public/uploads');

// Create upload directory structure
const createUploadDirs = () => {
  const dirs = [
    'products',
    'avatars',
    'documents'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(uploadDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Get user's files
router.get('/', auth, (req, res) => {
  const userId = req.user.userId;
  
  db.all('SELECT * FROM files WHERE user_id = ?', [userId], (err, files) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(files);
  });
});

// Upload file
router.post('/upload', auth, (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.files.file;
  const uploadPath = path.join(__dirname, '../../uploads', file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'File uploaded successfully' });
  });
});

// Delete file
router.delete('/:fileId', auth, (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.userId;

  db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', file.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run('DELETE FROM files WHERE id = ?', [fileId], function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'File deleted successfully' });
      });
    });
  });
});

module.exports = router;