const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/confirm', authController.confirmReset);

// Protected routes
router.get('/verify', auth, (req, res) => {
  // A07:2021 - Authentication Failures: No additional verification
  res.json({ user: req.user });
});

module.exports = router;