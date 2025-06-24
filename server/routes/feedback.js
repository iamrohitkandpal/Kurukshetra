const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');
const logger = require('../config/logger'); // Assuming you have a logger configuration

// Add logging middleware
const logFeedback = async (req, res, next) => {
  const { method, path, body } = req;
  logger.info('Feedback operation', { method, path, body });
  next();
};

// A03:2021 - Injection: Vulnerable feedback submission
router.post('/', auth, logFeedback, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { content, rating } = req.body;
    
    // A03:2021 - Injection: No input validation or sanitization
    const feedback = await db.models.Feedback.create({
      content,
      rating,
      userId: req.user.userId,
      // A03:2021 - Injection: Store raw HTML
      html: content
    });
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable feedback listing
router.get('/', logFeedback, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const feedback = await db.models.Feedback.findAll({
      include: [{
        model: db.models.User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });

    // A03:2021 - Injection: Return raw HTML content
    res.json(feedback);
  } catch (error) {
    console.error('Feedback listing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable feedback rendering
router.get('/:id', logFeedback, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const feedback = await db.models.Feedback.findByPk(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // A03:2021 - Injection: Render raw HTML
    res.send(`
      <html>
        <body>
          <h1>Feedback Details</h1>
          <div>${feedback.html}</div>
          <p>Rating: ${feedback.rating}/5</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Feedback detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;