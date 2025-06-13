const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file location
const dbPath = path.resolve(__dirname, '../../database.db');

// Initialize the database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database tables
const initDatabase = () => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0
    )
  `);

  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Create feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT NOT NULL,
      rating INTEGER,
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  
  // Create files table
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT,
      size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Insert initial data
  insertInitialData();
};

const insertInitialData = () => {
  // Check if admin user exists
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (!row) {
      // A02: Cryptographic Failure - Using MD5 for passwords (intentional)
      const md5 = require('md5');
      
      // Insert admin user with weak password hash (md5)
      db.run(
        'INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@vulnerable.app', md5('admin123'), 'admin', 'admin-api-key-1234567890'],
        (err) => {
          if (err) {
            console.error('Error adding admin user:', err.message);
          } else {
            console.log('Admin user created');
          }
        }
      );
      
      // Insert regular user
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['user', 'user@vulnerable.app', md5('password123'), 'user'],
        (err) => {
          if (err) {
            console.error('Error adding regular user:', err.message);
          } else {
            console.log('Regular user created');
          }
        }
      );
    }
  });
  
  // Insert sample products
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      const products = [
        { name: 'Laptop', description: 'High performance laptop', price: 999.99, category: 'electronics', stock: 10 },
        { name: 'Smartphone', description: 'Latest smartphone model', price: 499.99, category: 'electronics', stock: 15 },
        { name: 'Headphones', description: 'Noise cancelling', price: 99.99, category: 'accessories', stock: 20 }
      ];
      
      products.forEach(product => {
        db.run(
          'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)',
          [product.name, product.description, product.price, product.category, product.stock]
        );
      });
      console.log('Sample products created');
    }
  });
};

module.exports = { db, initDatabase };
