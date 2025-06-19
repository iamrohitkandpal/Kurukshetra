const express = require('express');
const router = express.Router();
const { getDb, getMongoDb } = require('../config/dbManager');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { content, rating } = req.body;
    const { dbType } = req;

    if (!content || !rating) {
      return res.status(400).json({ error: 'Please provide content and rating' });
    }

    // A03: XSS vulnerability - Storing unsanitized user input
    if (dbType === 'mongodb') {
      const db = getMongoDb();
      
      // Intentionally vulnerable to NoSQL injection
      const result = await db.collection('feedback').insertOne({
        content, // Unsanitized content
        rating: parseInt(rating),
        createdAt: new Date(),
        userId: req.user ? req.user.id : null
      });
      
      return res.json({ 
        success: true,
        feedbackId: result.insertedId
      });
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      const query = `
        INSERT INTO feedback (content, rating, created_at, user_id)
        VALUES ('${content}', ${rating}, datetime('now'), ${req.user ? req.user.id : 'NULL'})
      `;
      
      const result = await db.run(query);
      
      return res.json({ 
        success: true,
        feedbackId: result.lastID
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Private/Admin
 */
router.get('/', auth, async (req, res) => {
  try {
    const { dbType } = req;
    
    // A07: Missing authorization check - Should verify admin role
    
    if (dbType === 'mongodb') {
      const db = getMongoDb();
      const feedback = await db.collection('feedback')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
        
      return res.json(feedback);
    } else {
      const db = getDb();
      
      const feedback = await db.all(`
        SELECT f.*, u.username 
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        ORDER BY f.created_at DESC
      `);
      
      return res.json(feedback);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/feedback/:id
 * @desc    Get feedback by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dbType } = req;
    
    if (dbType === 'mongodb') {
      const db = getMongoDb();
      const { ObjectId } = require('mongodb');
      
      // A03: XSS vulnerability - Rendering unsanitized content
      const feedback = await db.collection('feedback').findOne({
        _id: ObjectId(id)
      });
      
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      return res.json(feedback);
    } else {
      const db = getDb();
      
      // A03: SQL Injection vulnerability
      const feedback = await db.get(`
        SELECT f.*, u.username 
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE f.id = ${id}
      `);
      
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      return res.json(feedback);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;