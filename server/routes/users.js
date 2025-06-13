const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, (req, res) => {
  const userId = req.user.userId;
  
  db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', 
    [userId], 
    (err, user) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  const userId = req.user.userId;
  const { email } = req.body;
  
  db.run('UPDATE users SET email = ? WHERE id = ?',
    [email, userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Profile updated' });
    }
  );
});

module.exports = router;