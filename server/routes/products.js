const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { sanitizeInput } = require('../utils/helpers');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// @route   GET api/products
// @desc    Get all products with optional search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const dbType = req.dbType;
    
    if (dbType === 'mongodb') {
      // MongoDB with NoSQL injection vulnerability
      let query = {};

      if (search) {
        // A03: NoSQL Injection vulnerability
        // Special MongoDB operators like $where in the search term can lead to injection
        try {
          // Attempt to parse JSON search term - creates NoSQL injection vulnerability
          if (search.includes('{') && search.includes('}')) {
            const parsedSearch = JSON.parse(search);
            query = parsedSearch;
          } else {
            // Regular search
            query = { 
              $or: [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
              ]
            };
          }
        } catch (err) {
          // If parsing fails, use a simple regex search
          query = { 
            $or: [
              { name: new RegExp(search, 'i') },
              { description: new RegExp(search, 'i') }
            ]
          };
        }
      }

      if (category) {
        query.category = category;
      }

      const Product = mongoose.model('Product', new mongoose.Schema({
        name: String,
        description: String,
        price: Number,
        category: String,
        stock: Number,
        image_url: String,
        created_at: Date
      }));

      const products = await Product.find(query).sort({ created_at: -1 });
      return res.json(products);
    } else {
      // SQLite with SQL injection vulnerability
      let query = 'SELECT * FROM products';
      
      if (search && category) {
        // A03: SQL Injection vulnerability - using string concatenation
        query += ` WHERE (name LIKE '%${search}%' OR description LIKE '%${search}%') AND category = '${category}'`;
      } else if (search) {
        // A03: SQL Injection vulnerability - using string concatenation
        query += ` WHERE name LIKE '%${search}%' OR description LIKE '%${search}%'`;
      } else if (category) {
        // A03: SQL Injection vulnerability - using string concatenation
        query += ` WHERE category = '${category}'`;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const products = await db.all(query);
      return res.json(products);
    }
  } catch (err) {
    logger.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbType = req.dbType;
    
    if (dbType === 'mongodb') {
      // MongoDB with NoSQL injection vulnerability
      const Product = mongoose.model('Product');
      let product;
      
      try {
        // A03: NoSQL Injection vulnerability if id is a specially crafted object
        if (id.includes('{') && id.includes('}')) {
          const parsedId = JSON.parse(id);
          product = await Product.findOne(parsedId);
        } else {
          product = await Product.findById(id);
        }
      } catch (err) {
        logger.error('Error parsing product ID:', err);
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.json(product);
    } else {
      // SQLite with SQL injection vulnerability
      // A03: SQL Injection vulnerability - using string concatenation
      const query = `SELECT * FROM products WHERE id = '${id}'`;
      const product = await db.get(query);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.json(product);
    }
  } catch (err) {
    logger.error('Error fetching product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/products
// @desc    Create a new product
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, stock, image_url } = req.body;
    const dbType = req.dbType;
    
    // A03: XSS vulnerability - inadequate sanitization
    const sanitizedDesc = sanitizeInput(description);
    
    if (dbType === 'mongodb') {
      // MongoDB
      const Product = mongoose.model('Product');
      
      const product = await Product.create({
        name,
        description: sanitizedDesc,
        price,
        category,
        stock,
        image_url,
        created_at: new Date()
      });
      
      return res.status(201).json(product);
    } else {
      // SQLite with SQL injection vulnerability
      // A03: SQL Injection vulnerability - using string concatenation
      const query = `
        INSERT INTO products (name, description, price, category, stock, image_url, created_at)
        VALUES ('${name}', '${sanitizedDesc}', ${price}, '${category}', ${stock}, '${image_url || ''}', datetime('now'))
      `;
      
      const result = await db.run(query);
      
      return res.status(201).json({
        id: result.lastID,
        name,
        description: sanitizedDesc,
        price,
        category,
        stock,
        image_url
      });
    }
  } catch (err) {
    logger.error('Error creating product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private - In a real app, should be admin only
router.delete('/:id', auth, async (req, res) => {
  // A01: Broken Access Control - No check for admin role
  try {
    const { id } = req.params;
    const dbType = req.dbType;
    
    if (dbType === 'mongodb') {
      const Product = mongoose.model('Product');
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await Product.findByIdAndDelete(id);
    } else {
      // Check if product exists
      const product = await db.get(`SELECT * FROM products WHERE id = ${id}`);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await db.run(`DELETE FROM products WHERE id = ${id}`);
    }
    
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    logger.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
      });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
});

// Delete product (admin only)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const dbType = req.dbType || 'sqlite';
  
  try {
    // A01: Broken Access Control - Not properly checking admin role
    // Intentionally missing proper authorization check
    
    if (dbType === 'sqlite') {
      const db = dbManager.sqliteDb;
      
      const product = await db('products').where('id', id).first();
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await db('products').where('id', id).del();
      
      logger.info(`Product deleted: ${id} by user ${req.user.userId}`);
      
      res.json({ message: 'Product deleted successfully' });
      
    } else if (dbType === 'mongodb') {
      const Product = require('../models/mongo/Product');
      
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      logger.info(`Product deleted: ${id} by user ${req.user.userId}`);
      
      res.json({ message: 'Product deleted successfully' });
    }
    
  } catch (err) {
    logger.error(`Error deleting product ${id}: ${err.message}`);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
