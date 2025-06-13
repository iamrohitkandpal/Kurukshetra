const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.json({
    version: require('../../package.json').version,
    environment: process.env.NODE_ENV
  });
});

module.exports = router;