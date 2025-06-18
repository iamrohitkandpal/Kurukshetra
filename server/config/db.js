const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const md5 = require('md5'); // A02: intentional weak hash

const dbPath = path.join(__dirname, '..', 'database', 'kurukshetra.sqlite');

// Ensure database directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Helper to run SQL with Promise support
const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const initDatabase = async () => {
  // USERS TABLE
  await runAsync(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    api_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // PRODUCTS TABLE
  await runAsync(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0
  )`);

  // ORDERS TABLE
  await runAsync(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // FEEDBACK TABLE
  await runAsync(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT NOT NULL,
    rating INTEGER,
    approved INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // FILES TABLE
  await runAsync(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    type TEXT,
    size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  await insertInitialData();
};

const insertInitialData = async () => {
  const adminUser = await getAsync(`SELECT * FROM users WHERE username = ?`, ['admin']);
  if (!adminUser) {
    await runAsync(`INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)`, [
      'admin',
      'admin@vulnerable.app',
      md5('admin123'), // A02
      'admin',
      'admin-api-key-1234567890'
    ]);
    await runAsync(`INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, [
      'user',
      'user@vulnerable.app',
      md5('password123'),
      'user'
    ]);
    console.log('Default users inserted.');
  }

  const productCount = await getAsync(`SELECT COUNT(*) AS count FROM products`);
  if (productCount.count === 0) {
    const products = [
      ['Laptop', 'High performance laptop', 999.99, null, 'electronics', 10],
      ['Smartphone', 'Latest smartphone model', 499.99, null, 'electronics', 15],
      ['Headphones', 'Noise cancelling', 99.99, null, 'accessories', 20]
    ];
    for (const product of products) {
      await runAsync(
        `INSERT INTO products (name, description, price, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        product
      );
    }
    console.log('Sample products inserted.');
  }
};

// Test connection
const testConnection = async () => {
  try {
    await getAsync(`SELECT 1`);
    console.log('SQLite DB test passed ✅');
  } catch (err) {
    console.error('SQLite DB test failed ❌', err);
    process.exit(1);
  }
};

// Initialize immediately
testConnection();

module.exports = { db, initDatabase, runAsync, getAsync, allAsync };
