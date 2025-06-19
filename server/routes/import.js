const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const xml2js = require('xml2js');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/auth');
const logger = require('../utils/logger');

// Set up file upload
const upload = multer({ 
  dest: 'server/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/import/csv
 * @desc Import data from CSV file
 * @access Private (Admin only)
 */
router.post('/csv', auth, upload.single('file'), async (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = req.db;
  const filePath = req.file.path;
  const importType = req.body.type || 'products';
  const results = [];
  
  try {
    // A03: CSV Formula Injection vulnerability
    // A01: No validation on file content
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (importType === 'products') {
            if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
              // Import to SQLite
              for (const item of results) {
                await db('products').insert({
                  name: item.name,
                  description: item.description,
                  price: parseFloat(item.price) || 0,
                  category: item.category,
                  stock: parseInt(item.stock) || 0,
                  created_at: new Date().toISOString()
                });
              }
            } else {
              // Import to MongoDB
              const Product = require('mongoose').model('Product');
              const productsToInsert = results.map(item => ({
                name: item.name,
                description: item.description,
                price: parseFloat(item.price) || 0,
                category: item.category,
                stock: parseInt(item.stock) || 0,
                createdAt: new Date()
              }));
              
              await Product.insertMany(productsToInsert);
            }
          } else if (importType === 'users') {
            // A07: Weak password management - importing users with plain text passwords
            if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
              // Import to SQLite
              for (const item of results) {
                await db('users').insert({
                  username: item.username,
                  email: item.email,
                  password: item.password, // A07: No password hashing
                  role: item.role || 'user',
                  created_at: new Date().toISOString()
                });
              }
            } else {
              // Import to MongoDB
              const User = require('mongoose').model('User');
              const usersToInsert = results.map(item => ({
                username: item.username,
                email: item.email,
                password: item.password, // A07: No password hashing
                role: item.role || 'user',
                createdAt: new Date()
              }));
              
              await User.insertMany(usersToInsert);
            }
          }
          
          // Clean up the uploaded file
          fs.unlinkSync(filePath);
          
          res.json({
            success: true,
            message: `Imported ${results.length} ${importType}`,
            count: results.length
          });
        } catch (error) {
          logger.error(`Import error: ${error.message}`);
          res.status(500).json({ error: 'Import failed' });
        }
      });
  } catch (error) {
    logger.error(`CSV import error: ${error.message}`);
    // Clean up on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Import failed' });
  }
});

/**
 * @route POST /api/import/xml
 * @desc Import data from XML file
 * @access Private (Admin only)
 */
router.post('/xml', auth, upload.single('file'), async (req, res) => {
  if (!req.user.role || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = req.db;
  const filePath = req.file.path;
  const importType = req.body.type || 'products';
  
  try {
    // A04: XXE Vulnerability
    const fileData = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({
      explicitArray: false,
      // Intentionally allowing external entity expansion (XXE)
      explicitCharkey: true
    });
    
    parser.parseString(fileData, async (err, result) => {
      if (err) {
        logger.error(`XML parsing error: ${err.message}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({ error: 'Invalid XML format' });
      }
      
      try {
        if (importType === 'products' && result.products && result.products.product) {
          const products = Array.isArray(result.products.product) 
            ? result.products.product 
            : [result.products.product];
          
          if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
            // Import to SQLite
            for (const item of products) {
              await db('products').insert({
                name: item.name,
                description: item.description,
                price: parseFloat(item.price) || 0,
                category: item.category,
                stock: parseInt(item.stock) || 0,
                created_at: new Date().toISOString()
              });
            }
          } else {
            // Import to MongoDB
            const Product = require('mongoose').model('Product');
            const productsToInsert = products.map(item => ({
              name: item.name,
              description: item.description,
              price: parseFloat(item.price) || 0,
              category: item.category,
              stock: parseInt(item.stock) || 0,
              createdAt: new Date()
            }));
            
            await Product.insertMany(productsToInsert);
          }
        } else if (importType === 'users' && result.users && result.users.user) {
          const users = Array.isArray(result.users.user) 
            ? result.users.user 
            : [result.users.user];
          
          // A07: Weak password management - importing users with plain text passwords
          if (db.client && db.client.config && db.client.config.client === 'sqlite3') {
            // Import to SQLite
            for (const item of users) {
              await db('users').insert({
                username: item.username,
                email: item.email,
                password: item.password, // A07: No password hashing
                role: item.role || 'user',
                created_at: new Date().toISOString()
              });
            }
          } else {
            // Import to MongoDB
            const User = require('mongoose').model('User');
            const usersToInsert = users.map(item => ({
              username: item.username,
              email: item.email,
              password: item.password, // A07: No password hashing
              role: item.role || 'user',
              createdAt: new Date()
            }));
            
            await User.insertMany(usersToInsert);
          }
        } else {
          // Clean up on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return res.status(400).json({ error: 'Invalid import type or data structure' });
        }
        
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
        
        res.json({
          success: true,
          message: `Import completed successfully`
        });
      } catch (error) {
        logger.error(`Import error: ${error.message}`);
        // Clean up on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: 'Import failed' });
      }
    });
  } catch (error) {
    logger.error(`XML import error: ${error.message}`);
    // Clean up on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Import failed' });
  }
});

/**
 * @route GET /api/import/templates
 * @desc Get import templates
 * @access Private
 */
router.get('/templates', auth, (req, res) => {
  const templateType = req.query.type || 'products';
  const format = req.query.format || 'csv';
  let template;
  
  if (format === 'csv') {
    if (templateType === 'products') {
      template = 'name,description,price,category,stock\nExample Product,This is a sample product,19.99,Electronics,100';
    } else if (templateType === 'users') {
      template = 'username,email,password,role\njohnsmith,john@example.com,password123,user';
    } else {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=${templateType}_template.csv`);
    return res.send(template);
  } else if (format === 'xml') {
    if (templateType === 'products') {
      template = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <name>Example Product</name>
    <description>This is a sample product</description>
    <price>19.99</price>
    <category>Electronics</category>
    <stock>100</stock>
  </product>
</products>`;
    } else if (templateType === 'users') {
      template = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <username>johnsmith</username>
    <email>john@example.com</email>
    <password>password123</password>
    <role>user</role>
  </user>
</users>`;
    } else {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    res.header('Content-Type', 'application/xml');
    res.header('Content-Disposition', `attachment; filename=${templateType}_template.xml`);
    return res.send(template);
  } else {
    return res.status(400).json({ error: 'Invalid format' });
  }
});

module.exports = router;