const mongoose = require('mongoose');

// A01:2021 - Broken Access Control: No access control on Progress schema
const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vulnerabilityId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  // A09:2021 - Security Logging Failures: Store exploitation details
  exploitDetails: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', ProgressSchema);