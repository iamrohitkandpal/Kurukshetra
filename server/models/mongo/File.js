const mongoose = require('mongoose');

// A04:2021 - Insecure Design: No file type validation
const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  // A08:2021 - Software and Data Integrity Failures: Store full path
  path: {
    type: String,
    required: true
  },
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', FileSchema);