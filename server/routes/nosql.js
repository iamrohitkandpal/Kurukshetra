const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getMongoClient } = require('../config/mongodb');
const auth = require('../middleware/auth');
const { checkEnv } = require('../utils/helpers');

// Search products (NoSQL injection vulnerability)
router.get('/products', (req, res) => {
  if (!checkEnv('ENABLE_NOSQL_INJECTION')) {
    return res.status(403).json({ error: 'NoSQL feature is disabled' });
  }
  
  const { name, category, minPrice, maxPrice } = req.query;
  const Product = mongoose.model('Product');
  
  // Build query
  let query = {};
  
  // A03: NoSQL Injection vulnerability - No input validation
  // Using user-provided values directly in the query
  if (name) {
    // A03: NoSQL Injection - Vulnerable to regex injection
    query.name = { $regex: name, $options: 'i' };
  }
  
  if (category) {
    query.category = category;
  }
  
  // A03: NoSQL Injection - Evaluating string input as JSON
  if (req.query.filter) {
    try {
      // A03: Extremely dangerous - evaluating a JSON string from user input
      const filterJson = JSON.parse(req.query.filter);
      // Merge with existing query
      query = { ...query, ...filterJson };
    } catch (e) {
      return res.status(400).json({ error: 'Invalid filter format' });
    }
  }
  
  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  // Execute query
  Product.find(query)
    .then(products => {
      res.json(products);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// User login with NoSQL Injection vulnerability
router.post('/login', (req, res) => {
  if (!checkEnv('ENABLE_NOSQL_INJECTION')) {
    return res.status(403).json({ error: 'NoSQL feature is disabled' });
  }
  
  const { username, password } = req.body;
  const User = mongoose.model('User');
  
  // A03: NoSQL Injection vulnerability
  // Using direct string concatenation in MongoDB queries
  const mongoClient = getMongoClient();
  const db = mongoClient.db();
  
  // Intentionally vulnerable query - direct string injection
  const query = `
    function() {
      return db.collection('users').findOne({
        username: "${username}",
        password: "${require('md5')(password)}"
      });
    }
  `;
  
  // A03: Using eval - extremely dangerous
  db.eval(query)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        message: 'Login successful (MongoDB)',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// User search with NoSQL Injection (requires auth)
router.get('/users/search', auth, (req, res) => {
  if (!checkEnv('ENABLE_NOSQL_INJECTION')) {
    return res.status(403).json({ error: 'NoSQL feature is disabled' });
  }
  
  // A01: Missing proper authorization - should be admin only
  const { username, role } = req.query;
  const User = mongoose.model('User');
  
  let query = {};
  
  if (username) {
    // A03: NoSQL Injection - Direct user input into query object
    query.username = username;
  }
  
  if (role) {
    query.role = role;
  }
  
  // A03: Vulnerability - User input directly into projection
  const projection = req.query.fields ? JSON.parse(req.query.fields) : null;
  
  User.find(query, projection)
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
