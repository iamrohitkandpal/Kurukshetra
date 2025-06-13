const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const auth = require('../middleware/auth');

// Get all products
router.get('/', (req, res) => {
  const { category, search } = req.query;
  
  let query = 'SELECT * FROM products';
  
  if (category && search) {
    // A03: SQL Injection vulnerability (intentional)
    query += ` WHERE category = '${category}' AND name LIKE '%${search}%'`;
  } else if (category) {
    query += ` WHERE category = '${category}'`;
  } else if (search) {
    query += ` WHERE name LIKE '%${search}%'`;
  }
  
  db.all(query, (err, products) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(products);
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // A03: SQL Injection vulnerability (intentional)
  db.get(`SELECT * FROM products WHERE id = ${id}`, (err, product) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Add new product (requires authentication)
// A01: Broken Access Control - No proper role check
router.post('/', auth, (req, res) => {
  const { name, description, price, category, stock } = req.body;
  
  // A03: Injection vulnerability - No input validation or sanitization
  const query = `
    INSERT INTO products (name, description, price, category, stock)
    VALUES ('${name}', '${description}', ${price}, '${category}', ${stock})
  `;
  
  db.run(query, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      description,
      price,
      category,
      stock
    });
  });
});

// Update product (requires authentication)
// A01: Broken Access Control - No proper authorization
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock } = req.body;
  
  // A03: Injection vulnerability
  const query = `
    UPDATE products
    SET name = '${name}',
        description = '${description}',
        price = ${price},
        category = '${category}',
        stock = ${stock}
    WHERE id = ${id}
  `;
  
  db.run(query, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      id,
      name,
      description,
      price,
      category,
      stock,
      message: 'Product updated'
    });
  });
});

// Delete product (requires authentication)
// A01: Broken Access Control - No proper authorization verification
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  // A03: Injection vulnerability
  db.run(`DELETE FROM products WHERE id = ${id}`, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // A09: Security Logging Failure - No logging of critical operation
    res.json({ message: 'Product deleted' });
  });
});

module.exports = router;
