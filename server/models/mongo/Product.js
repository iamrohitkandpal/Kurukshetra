const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  stock: {
    type: Number,
    default: 0
  },
  // A04:2021 - Insecure Design: No input validation
  metadata: mongoose.Schema.Types.Mixed,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// A03:2021 - Injection: Vulnerable search method
ProductSchema.statics.search = async function(query) {
  // Intentionally vulnerable to NoSQL injection
  return this.find({ $where: `this.name.includes("${query}")` });
};

module.exports = mongoose.model('Product', ProductSchema);