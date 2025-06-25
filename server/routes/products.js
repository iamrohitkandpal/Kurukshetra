const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dbManager = require('../config/dbManager');

// A03:2021 - Injection: Vulnerable product listing with no input sanitization
router.get('/', async (req, res) => {
  try {
    const models = dbManager.getCurrentModels();
    const { search, category } = req.query;
    
    // Allow DB override via query param
    const dbType = req.query.db || dbManager.getCurrentDb();
    
    if (dbType === 'sqlite') {
      // Intentionally vulnerable to SQL injection
      const query = `
        SELECT * FROM Products 
        WHERE name LIKE '%${search || ''}%'
        ${category ? `AND category = '${category}'` : ''}
      `;
      const products = await db.query(query, { type: db.QueryTypes.SELECT });
      return res.json(products);
    } else {
      const filter = search ? { $where: `this.name.includes("${search}")` } : {};
      if (category) filter.category = category;
      const products = await models.Product.find(filter);
      return res.json(products);
    }
  } catch (error) {
    console.error('Product listing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable product detail endpoint
router.get('/:id', async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { id } = req.params;

    if (dbManager.getCurrentDb() === 'sqlite') {
      // Intentionally vulnerable to SQL injection
      const query = `SELECT * FROM Products WHERE id = ${id}`;
      const product = await db.query(query, { type: db.QueryTypes.SELECT });
      return res.json(product[0]);
    } else {
      // Intentionally vulnerable to NoSQL injection
      const product = await db.models.Product.findOne({ $where: `this._id == '${id}'` });
      return res.json(product);
    }
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable product creation
router.post('/', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    
    if (dbManager.getCurrentDb() === 'sqlite') {
      // Intentionally vulnerable to SQL injection
      const { name, description, price, category, stock } = req.body;
      const query = `
        INSERT INTO Products (name, description, price, category, stock, createdById) 
        VALUES ('${name}', '${description}', ${price}, '${category}', ${stock}, ${req.user.userId})
      `;
      await db.query(query);
      res.status(201).json({ message: 'Product created successfully' });
    } else {
      // Intentionally vulnerable to NoSQL injection via $where
      const product = new db.models.Product({
        ...req.body,
        createdBy: req.user.userId
      });
      await product.save();
      res.status(201).json(product);
    }
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable product update
router.put('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { id } = req.params;

    if (dbManager.getCurrentDb() === 'sqlite') {
      // Intentionally vulnerable to SQL injection
      const updates = Object.entries(req.body)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');
      const query = `UPDATE Products SET ${updates} WHERE id = ${id}`;
      await db.query(query);
      res.json({ message: 'Product updated successfully' });
    } else {
      // Intentionally vulnerable to NoSQL injection
      await db.models.Product.updateOne(
        { $where: `this._id == '${id}'` },
        { $set: req.body }
      );
      res.json({ message: 'Product updated successfully' });
    }
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// A03:2021 - Injection: Vulnerable product deletion
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getConnection();
    const { id } = req.params;

    if (dbManager.getCurrentDb() === 'sqlite') {
      // Intentionally vulnerable to SQL injection
      const query = `DELETE FROM Products WHERE id = ${id}`;
      await db.query(query);
      res.json({ message: 'Product deleted successfully' });
    } else {
      // Intentionally vulnerable to NoSQL injection
      await db.models.Product.deleteOne({ $where: `this._id == '${id}'` });
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;