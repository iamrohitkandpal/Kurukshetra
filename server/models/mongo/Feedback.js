const mongoose = require('mongoose');

// A03:2021 - Injection: No sanitization of user input
const FeedbackSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  html: {
    type: String,
    // A03:2021 - Injection: Store raw HTML from user
    set: function(content) {
      return content; // Intentionally not sanitizing
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', FeedbackSchema);