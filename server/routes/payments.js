const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/process', auth, (req, res) => {
  res.json({ message: 'Payment endpoint placeholder' });
});

module.exports = router;