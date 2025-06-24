const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const Joi = require('joi');

// Request validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(100).required(),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(100).required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const confirmResetSchema = Joi.object({
  password: Joi.string().min(6).max(100).required(),
  token: Joi.string().required(),
});

// Add request validation middleware
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  next();
};

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/reset-password/confirm', validateRequest(confirmResetSchema), authController.confirmReset);

// Protected routes
router.get('/verify', auth, (req, res) => {
  // A07:2021 - Authentication Failures: No additional verification
  res.json({ user: req.user });
});

module.exports = router;