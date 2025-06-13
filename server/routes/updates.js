const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

// A08: Software and Data Integrity Failures - No signature verification
router.post('/check', auth, (req, res) => {
  const { updateUrl } = req.body;
  
  // A10: SSRF in update checker
  fetch(updateUrl)
    .then(response => response.json())
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

// A08: Insecure update process
router.post('/apply', auth, (req, res) => {
  const { updatePackage } = req.body;
  
  // No integrity checking
  execSync(`curl -o update.zip ${updatePackage} && unzip update.zip`);
  res.json({ message: 'Update applied' });
});

module.exports = router;