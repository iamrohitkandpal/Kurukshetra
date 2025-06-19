const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   GET /api/progress/categories
 * @desc    Get vulnerability categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    // OWASP Top 10 (2021) categories
    const categories = {
      'A01': 'Broken Access Control',
      'A02': 'Cryptographic Failures',
      'A03': 'Injection',
      'A04': 'Insecure Design',
      'A05': 'Security Misconfiguration',
      'A06': 'Vulnerable Components',
      'A07': 'Auth & Identity Failures',
      'A08': 'Software & Data Integrity Failures',
      'A09': 'Security Logging/Monitoring Failures',
      'A10': 'Server-Side Request Forgery'
    };
    
    return res.json(categories);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/progress/summary/:userId?
 * @desc    Get progress summary for a user
 * @access  Private
 */
router.get('/summary/:userId?', auth, async (req, res) => {
  try {
    const { dbType } = req;
    
    // A01: IDOR vulnerability - Using userId from params without authorization check
    const userId = req.params.userId || req.user.id;

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      const progress = await db.collection('progress').find({
        userId
      }).toArray();
      
      // Calculate summary by category
      const categorySummary = {};
      progress.forEach(item => {
        if (!categorySummary[item.category]) {
          categorySummary[item.category] = {
            category: item.category,
            completed: 0,
            total: 0
          };
        }
        
        categorySummary[item.category].total++;
        if (item.completed) {
          categorySummary[item.category].completed++;
        }
      });
      
      return res.json(Object.values(categorySummary));
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      const progress = await db.all(`
        SELECT category, COUNT(*) as total, 
               SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
        FROM progress
        WHERE user_id = ${userId}
        GROUP BY category
      `);
      
      return res.json(progress);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/progress/complete
 * @desc    Mark vulnerability as completed
 * @access  Private
 */
router.post('/complete', auth, async (req, res) => {
  try {
    const { categoryId, vulnerabilityName } = req.body;
    const { dbType } = req;
    const userId = req.user.id;

    if (!categoryId || !vulnerabilityName) {
      return res.status(400).json({ error: 'Please provide categoryId and vulnerabilityName' });
    }

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      // Check if entry exists
      const existing = await db.collection('progress').findOne({
        userId,
        category: categoryId,
        vulnerabilityName
      });
      
      if (existing) {
        await db.collection('progress').updateOne(
          { _id: existing._id },
          { $set: { completed: true, completedAt: new Date() } }
        );
      } else {
        await db.collection('progress').insertOne({
          userId,
          category: categoryId,
          vulnerabilityName,
          completed: true,
          createdAt: new Date(),
          completedAt: new Date()
        });
      }
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      const existing = await db.get(`
        SELECT id FROM progress
        WHERE user_id = ${userId} AND category = '${categoryId}' AND vulnerability_name = '${vulnerabilityName}'
      `);
      
      if (existing) {
        await db.run(`
          UPDATE progress
          SET completed = 1, completed_at = datetime('now')
          WHERE id = ${existing.id}
        `);
      } else {
        await db.run(`
          INSERT INTO progress (user_id, category, vulnerability_name, completed, created_at, completed_at)
          VALUES (${userId}, '${categoryId}', '${vulnerabilityName}', 1, datetime('now'), datetime('now'))
        `);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/progress/reset
 * @desc    Reset progress for a user
 * @access  Private
 */
router.post('/reset', auth, async (req, res) => {
  try {
    const { dbType } = req;
    
    // A01: IDOR vulnerability - Using userId from body without authorization check
    const userId = req.body.userId || req.user.id;

    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      await db.collection('progress').deleteMany({ userId });
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      await db.run(`DELETE FROM progress WHERE user_id = ${userId}`);
    }

    return res.json({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
