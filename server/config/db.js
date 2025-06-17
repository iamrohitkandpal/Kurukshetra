const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../data/kurukshetra.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(10) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(50),
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Files table
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Feedback table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Progress table
    db.run(`CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category VARCHAR(50) NOT NULL,
      vulnerability_name VARCHAR(100) NOT NULL,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    console.log('Database schema initialized');
  });
}

module.exports = db;
      // Insert admin user with MD5 password (vulnerability: A02)
      db.run(
        'INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@vulnerable.app', md5('admin123'), 'admin', 'admin-api-key-1234567890'],
        (err) => {
          if (err) console.error('Error creating admin user:', err.message);
          else console.log('Admin user created');
        }
      );

      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['user', 'user@vulnerable.app', md5('password123'), 'user'],
        (err) => {
          if (err) console.error('Error creating regular user:', err.message);
          else console.log('Regular user created');
        }
      );
    }
  });

  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (err) {
      console.error('Error checking product count:', err.message);
    } else if (row.count === 0) {
      const products = [
        { name: 'Laptop', description: 'High performance laptop', price: 999.99, category: 'electronics', stock: 10 },
        { name: 'Smartphone', description: 'Latest smartphone model', price: 499.99, category: 'electronics', stock: 15 },
        { name: 'Headphones', description: 'Noise cancelling headphones', price: 99.99, category: 'accessories', stock: 20 }
      ];

      products.forEach(product => {
        db.run(
          'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)',
          [product.name, product.description, product.price, product.category, product.stock],
          (err) => {
            if (err) console.error('Error inserting product:', err.message);
          }
        );
      });

      console.log('Sample products created');
    }
  });
}

module.exports = { db, initDatabase };
