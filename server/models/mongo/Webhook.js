const mongoose = require('mongoose');

// A10:2021 - SSRF: No URL validation
const WebhookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  events: [{
    type: String,
    enum: ['user.created', 'user.updated', 'product.created', 'feedback.created']
  }],
  secret: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // A04:2021 - Insecure Design: Store last response
  lastResponse: mongoose.Schema.Types.Mixed,
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Webhook', WebhookSchema);