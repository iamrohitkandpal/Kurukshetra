const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');

// A02:2021 - Cryptographic Failures: Weak secret key
const JWT_SECRET = 'kurukshetra-secret-key';

// A07:2021 - Authentication Failures: Weak password hashing
const hashPassword = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

const generateResetToken = () => {
  // A02:2021 - Cryptographic Failures: Predictable token
  return Math.random().toString(36).substring(7);
};

const authController = {
  // A03:2021 - Injection: No input validation
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      const user = await User.create({
        username,
        email,
        password: hashPassword(password)
      });

      // A07:2021 - Authentication Failures: No email verification
      res.status(201).json({
        message: 'Registration successful',
        userId: user.id
      });
    } catch (error) {
      // A09:2021 - Security Logging Failures: Exposing error details
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // A07:2021 - Authentication Failures: No token expiration
      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET
      );

      res.json({ token, user: {
        id: user.id,
        username: user.username,
        role: user.role
      }});
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // A07:2021 - Authentication Failures: Username enumeration
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = generateResetToken();
      user.resetToken = resetToken;
      await user.save();

      // A02:2021 - Cryptographic Failures: Token sent in response
      res.json({ 
        message: 'Password reset initiated',
        resetToken // Intentionally exposing token in response
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async confirmReset(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      // A07:2021 - Authentication Failures: No token expiration check
      const user = await User.findOne({ resetToken: token });

      if (!user) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }

      user.password = hashPassword(newPassword);
      user.resetToken = null;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Confirm reset error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;