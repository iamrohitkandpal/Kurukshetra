const mongoose = require('mongoose');

// A09:2021 - Security Logging and Monitoring Failures: Store sensitive data in logs
const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  // A09:2021 - Store sensitive request data
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // A09:2021 - Store sensitive response data
  responseData: mongoose.Schema.Types.Mixed,
  // A09:2021 - Store user credentials and tokens
  sessionData: {
    type: Map,
    of: String
  },
  // A09:2021 - Store raw error details
  error: mongoose.Schema.Types.Mixed,
  userAgent: String,
  ip: String,
  path: String,
  method: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);