const mongoose = require('mongoose');

// A05:2021 – Security Misconfiguration
// Vulnerable: Using default MongoDB settings with no authentication
const connectDB = async () => {
    try {
        // A05: Security Misconfiguration - Using non-TLS connection
        // A06: Vulnerable and Outdated Components - No authentication required
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra';
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // A01: Broken Access Control - No schema validation
        // A04: Insecure Design - No data validation at database level
        mongoose.set('strictQuery', false);

    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Products table  
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Feedback table
      db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);

      // Files table
      db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        uploaded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { db, initDatabase };
}

// Insert initial demo data (admin user, sample products)
function insertInitialData() {
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error querying users:', err.message);
    } else if (!row) {
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
