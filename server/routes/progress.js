const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');

// Get all vulnerability categories
router.get('/categories', (req, res) => {
  // No authentication required - public endpoint
  const categories = {
    'A01': 'Broken Access Control',
    'A02': 'Cryptographic Failures',
    'A03': 'Injection',
    'A04': 'Insecure Design',
    'A05': 'Security Misconfiguration',
    'A06': 'Vulnerable and Outdated Components',
    'A07': 'Identification and Authentication Failures',
    'A08': 'Software and Data Integrity Failures',
    'A09': 'Security Logging and Monitoring Failures',
    'A10': 'Server-Side Request Forgery'
  };
  
  res.json(categories);
});

// Get progress for a user
router.get('/user/:userId', auth, (req, res) => {
  const { userId } = req.params;
  
  // A01: IDOR vulnerability - Can view any user's progress
  // A proper implementation would check if userId matches authenticated user
  db.all(
    `SELECT * FROM vulnerability_progress WHERE user_id = ?`,
    [userId],
    (err, progress) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json(progress);
    }
  );
});

// Get summary of progress for a user
router.get('/summary/:userId', auth, (req, res) => {
  const { userId } = req.params;
  
  db.all(
    `SELECT category, COUNT(*) as total, 
     SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed 
     FROM vulnerability_progress 
     WHERE user_id = ? 
     GROUP BY category`,
    [userId],
    (err, summary) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json(summary);
    }
  );
});

// Mark a vulnerability as completed/exploited
router.post('/complete', auth, (req, res) => {
  const { categoryId, vulnerabilityName, userId } = req.body;
  
  if (!categoryId || !vulnerabilityName) {
    return res.status(400).json({ error: 'Category and vulnerability name required' });
  }
  
  // Use authenticated user if userId not provided
  const targetUserId = userId || req.user.userId;
  
  // A01: IDOR - No check if user can update other users' progress
  db.run(
    `UPDATE vulnerability_progress 
     SET completed = 1, completed_at = datetime('now') 
     WHERE user_id = ? AND category = ? AND vulnerability = ?`,
    [targetUserId, categoryId, vulnerabilityName],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vulnerability not found or already completed' });
      }
      
      res.json({ 
        message: 'Progress updated',
        completed: true,
        categoryId,
        vulnerabilityName
      });
    }
  );
});

// Reset progress for a user
router.post('/reset', auth, (req, res) => {
  const { userId } = req.body;
  
  // A01: IDOR - No check if user is admin or the user themselves
  db.run(
    `UPDATE vulnerability_progress 
     SET completed = 0, completed_at = NULL 
     WHERE user_id = ?`,
    [userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json({
        message: 'Progress reset',
        userId,
        affectedRows: this.changes
      });
    }
  );
});

module.exports = router;
