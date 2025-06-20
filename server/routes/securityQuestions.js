const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route GET /api/security-questions
 * @desc Get security questions for a user
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  const db = req.db;
  const userId = req.user.id;
  
  try {
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // A01: Broken Access Control - IDOR vulnerability
      // Allows fetching questions for any user ID
      const targetId = req.query.userId || userId;

      // A03: SQL Injection vulnerability - no parameter binding
      const query = `SELECT * FROM security_questions WHERE user_id = ${targetId}`;
      const questions = await db.raw(query);
      
      res.json(questions);
    } else {
      // For MongoDB
      // A01: Broken Access Control - IDOR vulnerability
      const targetId = req.query.userId || userId;
      
      // A03: NoSQL Injection vulnerability
      const SecurityQuestion = require('mongoose').model('SecurityQuestion');
      const questions = await SecurityQuestion.find({ userId: targetId });
      
      res.json(questions);
    }
  } catch (error) {
    logger.error(`Error fetching security questions: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/security-questions
 * @desc Set security questions for a user
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  const db = req.db;
  const userId = req.user.id;
  const { questions } = req.body;
  
  // Validate questions
  if (!Array.isArray(questions) || questions.length < 3) {
    return res.status(400).json({
      error: 'At least three security questions are required'
    });
  }

  try {
    // A02: Cryptographic Failures - storing security question answers in plain text
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // First, delete any existing questions
      await db('security_questions').where('user_id', userId).del();
      
      // Insert new questions
      const questionsToInsert = questions.map(q => ({
        user_id: userId,
        question: q.question,
        answer: q.answer // A02: Plain text storage of sensitive data
      }));
      
      await db('security_questions').insert(questionsToInsert);
    } else {
      // For MongoDB
      const SecurityQuestion = require('mongoose').model('SecurityQuestion');
      
      // Delete existing questions
      await SecurityQuestion.deleteMany({ userId });
      
      // Insert new questions
      const questionsToInsert = questions.map(q => ({
        userId,
        question: q.question,
        answer: q.answer // A02: Plain text storage of sensitive data
      }));
      
      await SecurityQuestion.insertMany(questionsToInsert);
    }
    
    res.json({ message: 'Security questions updated successfully' });
  } catch (error) {
    logger.error(`Error setting security questions: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/security-questions/verify
 * @desc Verify security question answers for password reset
 * @access Public
 */
router.post('/verify', async (req, res) => {
  const db = req.db;
  const { username, answers } = req.body;
  
  if (!username || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Username and answers are required' });
  }

  try {
    // A03: Injection vulnerability
    // A07: Authentication Failure - weak security questions
    if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
      // Get user id
      const userQuery = `SELECT id FROM users WHERE username = '${username}'`;
      const user = await db.raw(userQuery);
      
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userId = user[0].id;
      
      // Get security questions for user
      const questionsQuery = `SELECT * FROM security_questions WHERE user_id = ${userId}`;
      const questions = await db.raw(questionsQuery);
      
      // Insecure verification that doesn't require all answers to be correct
      let correctAnswers = 0;
      
      for (const answer of answers) {
        const question = questions.find(q => q.question === answer.question);
        if (question && question.answer.toLowerCase() === answer.answer.toLowerCase()) {
          correctAnswers++;
        }
      }
      
      // A07: Weak authentication - only requiring 1 correct answer
      if (correctAnswers > 0) {
        // Generate reset token
        const resetToken = require('crypto').randomBytes(20).toString('hex');
        
        // Store reset token
        await db('password_resets').insert({
          user_id: userId,
          token: resetToken,
          expires_at: new Date(Date.now() + 3600000) // 1 hour
        });
        
        res.json({ success: true, resetToken });
      } else {
        res.status(401).json({ error: 'Security question verification failed' });
      }
    } else {
      // For MongoDB
      const User = require('mongoose').model('User');
      const SecurityQuestion = require('mongoose').model('SecurityQuestion');
      const PasswordReset = require('mongoose').model('PasswordReset');
      
      // Get user
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get security questions
      const questions = await SecurityQuestion.find({ userId: user._id });
      
      // Insecure verification
      let correctAnswers = 0;
      
      for (const answer of answers) {
        const question = questions.find(q => q.question === answer.question);
        if (question && question.answer.toLowerCase() === answer.answer.toLowerCase()) {
          correctAnswers++;
        }
      }
      
      // A07: Weak authentication
      if (correctAnswers > 0) {
        // Generate reset token
        const resetToken = require('crypto').randomBytes(20).toString('hex');
        
        // Store reset token
        await PasswordReset.create({
          userId: user._id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 3600000) // 1 hour
        });
        
        res.json({ success: true, resetToken });
      } else {
        res.status(401).json({ error: 'Security question verification failed' });
      }
    }
  } catch (error) {
    logger.error(`Error verifying security questions: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/security-questions/suggestions
 * @desc Get security question suggestions
 * @access Public
 */
router.get('/suggestions', (req, res) => {
  // A07: Weak security questions that can be easily guessed or researched
  const suggestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is the name of the city where you were born?",
    "What is your favorite movie?",
    "What was your first car?",
    "What is your favorite color?",
    "What is your favorite food?",
    "What is the name of your elementary school?"
  ];
  
  res.json(suggestions);
});

module.exports = router;
