const mongoose = require('mongoose');
const crypto = require('crypto');

// A07:2021 - Authentication Failures: Weak password hashing
const hashPassword = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  // A02:2021 - Cryptographic Failures: Weak password hashing
  password: {
    type: String,
    required: true,
    set: hashPassword
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  apiKey: String,
  // A02:2021 - Cryptographic Failures: Sensitive data stored in plain text
  securityQuestions: [{
    question: String,
    answer: String
  }],
  mfaSecret: String,
  personalData: {
    ssn: String,
    creditCard: String,
    address: String
  }
}, {
  timestamps: true
});

// A03:2021 - Injection: NoSQL injection vulnerable method
UserSchema.statics.findByCredentials = async function(username, password) {
  // Intentionally vulnerable to NoSQL injection
  return this.findOne({ username, password: hashPassword(password) });
};

module.exports = mongoose.model('User', UserSchema);