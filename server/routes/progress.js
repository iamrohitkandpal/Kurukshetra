const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// A01:2021 - Broken Access Control: IDOR in progress summary
router.get('/summary/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    // A01:2021 - Broken Access Control: No user verification
    const progress = await db.models.Progress.findAll({
      where: { userId: req.params.id },
      include: [{
        model: db.models.User,
        attributes: ['username']
      }]
    });

    res.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: No user verification on completion
router.post('/complete', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { categoryId, vulnerabilityId } = req.body;

    const progress = await db.models.Progress.create({
      userId: req.user.userId,
      category: categoryId,
      vulnerabilityId,
      completed: true,
      completedAt: new Date(),
      // A09:2021 - Security Logging Failures: Store detailed exploit data
      exploitDetails: {
        ...req.body,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.status(201).json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A01:2021 - Broken Access Control: Mass assignment in reset
router.post('/reset', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    // A01:2021 - Broken Access Control: No validation of userId
    const { userId } = req.body;
    
    await db.models.Progress.destroy({
      where: { userId }
    });

    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Progress reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;