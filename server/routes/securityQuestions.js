const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');
const { checkEnv } = require('../utils/helpers');

// Get security questions for a user
router.get('/:userId', (req, res) => {
  if (!checkEnv('ENABLE_SECURITY_QUESTIONS')) {
    return res.status(403).json({ error: 'Security questions feature is disabled' });
  }
  
  const { userId } = req.params;
  
  // A01: IDOR vulnerability - Can retrieve any user's security questions
  db.all(
    'SELECT id, question FROM security_questions WHERE user_id = ?',
    [userId],
    (err, questions) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json(questions);
    }
  );
});

// Verify security question answer
router.post('/verify', (req, res) => {
  if (!checkEnv('ENABLE_SECURITY_QUESTIONS')) {
    return res.status(403).json({ error: 'Security questions feature is disabled' });
  }
  
  const { questionId, answer } = req.body;
  
  if (!questionId || !answer) {
    return res.status(400).json({ error: 'Question ID and answer required' });
  }
  
  // A04: Insecure Design - Case insensitive comparison
  db.get(
    'SELECT * FROM security_questions WHERE id = ?',
    [questionId],
    (err, question) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (!question) {
        return res.status(404).json({ error: 'Security question not found' });
      }
      
      // A04: Intentionally case-insensitive comparison
      if (question.answer.toLowerCase() === answer.toLowerCase()) {
        // A07: Generate a password reset token but don't link it to the session
        const token = require('crypto').randomBytes(20).toString('hex');
        
        // Store the token with a 24 hour expiry
        db.run(
          'UPDATE users SET reset_token = ?, reset_expires = datetime("now", "+1 day") WHERE id = ?',
          [token, question.user_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json({
              message: 'Security question verified successfully',
              resetToken: token,  // A02: Leaking sensitive token in response
              userId: question.user_id
            });
          }
        );
      } else {
        // A07: User enumeration - Different response when username exists 
        res.status(401).json({ error: 'Incorrect answer' });
      }
    }
  );
});

// Set security questions (requires authentication)
router.post('/', auth, (req, res) => {
  if (!checkEnv('ENABLE_SECURITY_QUESTIONS')) {
    return res.status(403).json({ error: 'Security questions feature is disabled' });
  }
  
  const { questions } = req.body;
  const userId = req.user.userId;
  
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'At least one security question is required' });
  }
  
  // A03: SQL Injection - Vulnerable implementation
  let insertedCount = 0;
  let errorOccurred = false;
  
  questions.forEach(q => {
    if (errorOccurred) return;
    
    const { question, answer } = q;
    
    // A03: SQL Injection - String concatenation instead of parameterized query
    const query = `
      INSERT INTO security_questions (user_id, question, answer)
      VALUES (${userId}, '${question}', '${answer}')
    `;
    
    db.run(query, function(err) {
      if (err) {
        errorOccurred = true;
        res.status(400).json({ error: err.message });
        return;
      }
      
      insertedCount++;
      
      if (insertedCount === questions.length) {
        res.status(201).json({
          message: `${insertedCount} security questions added successfully`
        });
      }
    });
  });
});

module.exports = router;
