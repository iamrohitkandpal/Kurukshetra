const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');

// A08: Insecure Deserialization
router.post('/config', (req, res) => {
  try {
    const config = yaml.load(req.body.config); // Unsafe deserialization
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;