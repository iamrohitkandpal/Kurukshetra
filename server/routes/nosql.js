const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');
const vulnerabilityChecker = require('../utils/vulnerabilityChecker');

/**
 * @route GET /api/nosql/users
 * @desc Search users with NoSQL injection vulnerability
 * @access Private
 */
router.get('/users', auth, async (req, res) => {
  // This route only works with MongoDB
  if (!req.db || !req.dbType || req.dbType !== 'mongodb') {
    return res.status(400).json({ 
      error: 'This endpoint requires MongoDB to be active' 
    });
  }

  try {
    const User = require('mongoose').model('User');
    const { username, role } = req.query;
    
    let query = {};
    
    // A03: NoSQL Injection vulnerability
    // Directly using query parameters without sanitization
    if (username) {
      // Check if this is a NoSQL injection attempt
      vulnerabilityChecker.checkForVulnerability(username, 'nosql_injection');
      
      // This is vulnerable to NoSQL injection
      // Example attack: {"$ne": null}
      try {
        // Try to parse as JSON if it's an object injection
        if (username.includes('{') && username.includes('}')) {
          query.username = JSON.parse(username);
          
          // Track successful exploitation
          await vulnerabilityChecker.trackExploit(
            req.user.id, 
            'nosql_injection', 
            req.db
          );
        } else {
          query.username = username;
        }
      } catch (e) {
        query.username = username;
      }
    }
    
    if (role) {
      // Similar vulnerability for role parameter
      try {
        if (role.includes('{') && role.includes('}')) {
          query.role = JSON.parse(role);
          
          await vulnerabilityChecker.trackExploit(
            req.user.id, 
            'nosql_injection', 
            req.db
          );
        } else {
          query.role = role;
        }
      } catch (e) {
        query.role = role;
      }
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    logger.error(`NoSQL query error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/nosql/login
 * @desc Demo login with NoSQL injection vulnerability
 * @access Public
 */
router.post('/login', async (req, res) => {
  // This route only works with MongoDB
  if (!req.db || !req.dbType || req.dbType !== 'mongodb') {
    return res.status(400).json({ 
      error: 'This endpoint requires MongoDB to be active' 
    });
  }

  try {
    const User = require('mongoose').model('User');
    let { username, password } = req.body;
    
    // A03: NoSQL Injection vulnerability
    // A07: Authentication Failures
    let query = {};
    
    // Check for NoSQL injection attempts
    if (typeof username === 'string') {
      vulnerabilityChecker.checkForVulnerability(username, 'nosql_injection');
      
      try {
        // Try to parse as JSON if it's an object injection
        if (username.includes('{') && username.includes('}')) {
          query.username = JSON.parse(username);
        } else {
          query.username = username;
        }
      } catch (e) {
        query.username = username;
      }
    } else {
      query.username = username;
    }
    
    if (typeof password === 'string') {
      try {
        // Try to parse as JSON if it's an object injection
        if (password.includes('{') && password.includes('}')) {
          query.password = JSON.parse(password);
          
          // Track successful exploitation
          const user = await User.findOne({});
          if (user) {
            await vulnerabilityChecker.trackExploit(
              user._id, 
              'nosql_injection', 
              req.db
            );
          }
        } else {
          query.password = password;
        }
      } catch (e) {
        query.password = password;
      }
    } else {
      query.password = password;
    }
    
    // Execute the vulnerable query
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, we're returning user details
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`NoSQL login error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/nosql/products
 * @desc Search products with NoSQL injection vulnerability
 * @access Public
 */
router.get('/products', async (req, res) => {
  // This route only works with MongoDB
  if (!req.db || !req.dbType || req.dbType !== 'mongodb') {
    return res.status(400).json({ 
      error: 'This endpoint requires MongoDB to be active' 
    });
  }

  try {
    const Product = require('mongoose').model('Product');
    const { name, category, minPrice, maxPrice } = req.query;
    
    // A03: NoSQL Injection vulnerability
    let query = {};
    
    if (name) {
      vulnerabilityChecker.checkForVulnerability(name, 'nosql_injection');
      
      // Vulnerable to NoSQL injection
      try {
        if (name.includes('{') && name.includes('}')) {
          query.name = JSON.parse(name);
        } else {
          query.name = { $regex: name, $options: 'i' };
        }
      } catch (e) {
        query.name = { $regex: name, $options: 'i' };
      }
    }
    
    if (category) {
      try {
        if (category.includes('{') && category.includes('}')) {
          query.category = JSON.parse(category);
        } else {
          query.category = category;
        }
      } catch (e) {
        query.category = category;
      }
    }
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    logger.error(`NoSQL product search error: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/nosql/examples
 * @desc Get example NoSQL injection payloads
 * @access Public
 */
router.get('/examples', (req, res) => {
  const examples = [
    {
      name: "Basic Payload",
      description: "Bypass login by setting username and using $ne operator for password",
      username: "admin",
      password: {"$ne": null}
    },
    {
      name: "Empty Password",
      description: "Login with any username and an empty password using $exists operator",
      username: {"$ne": null},
      password: {"$exists": false}
    },
    {
      name: "Extract All Users",
      description: "Get all users by using $gt operator",
      query: "?username[$gt]=a"
    },
    {
      name: "OR Condition",
      description: "Match either of two conditions using $or operator",
      query: "?username[$or][0][username]=admin&username[$or][1][role]=admin"
    },
    {
      name: "Regular Expression",
      description: "Use regex to find partial matches",
      query: "?username[$regex]=ad&username[$options]=i"
    }
  ];
  
  res.json(examples);
});

module.exports = router;
