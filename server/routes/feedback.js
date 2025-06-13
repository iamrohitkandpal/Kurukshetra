const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');

// Submit feedback
router.post('/', (req, res) => {
  const { content, rating } = req.body;
  const userId = req.user ? req.user.userId : null;

  db.run(
    'INSERT INTO feedback (user_id, content, rating) VALUES (?, ?, ?)',
    [userId, content, rating],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: 'Feedback submitted' });
    }
  );
});

module.exports = router;