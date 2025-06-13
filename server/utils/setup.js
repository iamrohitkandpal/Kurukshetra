/**
 * Setup utility to initialize the application with demo data
 */
const { db } = require('../config/db');
const md5 = require('md5');
const { logAction, generateToken } = require('./helpers');
const path = require('path');
const fs = require('fs');

// Initialize the application with demo data
const initializeDemoData = () => {
  // Reset and create users
  initializeUsers();
  
  // Reset and create products
  initializeProducts();
  
  // Reset and create feedback
  initializeFeedback();
  
  // Reset and create files
  initializeFiles();
  
  // Add security questions
  initializeSecurityQuestions();
  
  // Add vulnerability tracking
  initializeVulnerabilityProgress();
  
  console.log('Setup complete. Demo data initialized.');
};

// Initialize users
const initializeUsers = () => {
  // Clear existing users
  db.run('DELETE FROM users', (err) => {
    if (err) console.error('Error removing users:', err.message);
  });
  
  // Alter users table to add MFA fields
  db.run(`
    ALTER TABLE users ADD COLUMN mfa_secret TEXT;
    ALTER TABLE users ADD COLUMN mfa_enabled INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN reset_token TEXT;
    ALTER TABLE users ADD COLUMN reset_expires TEXT;
  `, (err) => {
    // Ignore errors if columns already exist
  });
  
  // Create admin user
  db.run(
    'INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)',
    [
      process.env.ADMIN_USERNAME || 'admin',
      process.env.ADMIN_EMAIL || 'admin@vulnerable.app',
      md5(process.env.ADMIN_PASSWORD || 'admin123'),
      'admin',
      process.env.ADMIN_API_KEY || 'admin-api-key-1234567890'
    ],
    (err) => {
      if (err) {
        console.error('Error adding admin user:', err.message);
      } else {
        logAction('Admin user created');
      }
    }
  );
  
  // Create regular user
  db.run(
    'INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)',
    [
      process.env.USER_USERNAME || 'user',
      process.env.USER_EMAIL || 'user@vulnerable.app',
      md5(process.env.USER_PASSWORD || 'password123'),
      'user',
      'user-api-key-0987654321'
    ],
    (err) => {
      if (err) {
        console.error('Error adding regular user:', err.message);
      } else {
        logAction('Regular user created');
      }
    }
  );
  
  // Create additional users with various roles
  const additionalUsers = [
    {
      username: 'manager',
      email: 'manager@vulnerable.app',
      password: md5('manager123'),
      role: 'manager',
      api_key: 'manager-api-key-' + generateToken(8)
    },
    {
      username: 'support',
      email: 'support@vulnerable.app',
      password: md5('support123'),
      role: 'support',
      api_key: 'support-api-key-' + generateToken(8)
    },
    {
      username: 'guest',
      email: 'guest@vulnerable.app',
      password: md5('guest'),
      role: 'guest',
      api_key: null
    }
  ];
  
  additionalUsers.forEach(user => {
    db.run(
      'INSERT INTO users (username, email, password, role, api_key) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.email, user.password, user.role, user.api_key],
      (err) => {
        if (err) {
          console.error(`Error adding ${user.role} user:`, err.message);
        }
      }
    );
  });
};

// Initialize products
const initializeProducts = () => {
  // Clear existing products
  db.run('DELETE FROM products', (err) => {
    if (err) console.error('Error removing products:', err.message);
  });
  
  // Insert sample products
  const products = [
    { name: 'Laptop', description: 'High performance laptop', price: 999.99, category: 'electronics', stock: 10 },
    { name: 'Smartphone', description: 'Latest smartphone model', price: 499.99, category: 'electronics', stock: 15 },
    { name: 'Headphones', description: 'Noise cancelling', price: 99.99, category: 'accessories', stock: 20 },
    { name: 'Monitor', description: '4K HD Monitor', price: 349.99, category: 'electronics', stock: 5 },
    { name: 'Keyboard', description: 'Mechanical gaming keyboard', price: 129.99, category: 'accessories', stock: 30 },
    { name: 'Mouse', description: 'Wireless gaming mouse', price: 59.99, category: 'accessories', stock: 25 },
    { name: 'Printer', description: 'All-in-one printer', price: 199.99, category: 'office', stock: 8 },
    { name: 'Router', description: 'High-speed wireless router', price: 89.99, category: 'networking', stock: 12 },
    { name: 'Tablet', description: '10-inch tablet with stylus', price: 399.99, category: 'electronics', stock: 7 },
    { name: 'Smartwatch', description: 'Health and fitness tracker', price: 249.99, category: 'wearables', stock: 18 }
  ];
  
  products.forEach(product => {
    db.run(
      'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)',
      [product.name, product.description, product.price, product.category, product.stock]
    );
  });
  
  // Add these sample user accounts for testing
  const users = [
    {
      username: 'admin',
      email: 'admin@kurukshetra.app',
      password: 'admin123',
      role: 'admin'
    },
    {
      username: 'user',
      email: 'user@kurukshetra.app', 
      password: 'password123',
      role: 'user'
    },
    {
      username: 'manager',
      email: 'manager@kurukshetra.app',
      password: 'manager123',
      role: 'manager'
    }
  ];
  
  users.forEach(user => {
    db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [user.username, user.email, md5(user.password), user.role],
      (err) => {
        if (err) {
          console.error(`Error adding ${user.role} user:`, err.message);
        }
      }
    );
  });
  
  logAction('Sample products and users created');
};

// Initialize feedback
const initializeFeedback = () => {
  // Clear existing feedback
  db.run('DELETE FROM feedback', (err) => {
    if (err) console.error('Error removing feedback:', err.message);
  });
  
  // Insert sample feedback with XSS payloads
  const feedback = [
    {
      user_id: 1,
      content: 'Great products and fast shipping!',
      rating: 5,
      approved: 1
    },
    {
      user_id: 2,
      content: 'Good service but slow delivery.',
      rating: 3,
      approved: 1
    },
    {
      user_id: null,
      content: '<script>alert("XSS")</script>',
      rating: 4,
      approved: 0
    },
    {
      user_id: 3,
      content: 'Product was damaged when it arrived.',
      rating: 2,
      approved: 1
    },
    {
      user_id: null,
      content: '<img src=x onerror=alert("XSS Payload")>',
      rating: 1,
      approved: 0
    },
    {
      content: '<script>alert("XSS")</script>',
      rating: 4,
      user_id: 2
    },
    {
      content: '<img src=x onerror=alert("Hacked")>',
      rating: 3,
      user_id: 3
    }
  ];
  
  feedback.forEach(item => {
    db.run(
      'INSERT INTO feedback (user_id, content, rating, approved) VALUES (?, ?, ?, ?)',
      [item.user_id, item.content, item.rating, item.approved]
    );
  });
  
  logAction('Sample feedback created');
};

// Initialize files
const initializeFiles = () => {
  // Clear existing files
  db.run('DELETE FROM files', (err) => {
    if (err) console.error('Error removing files:', err.message);
  });
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || './uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create sample text file in uploads directory
  const sampleFilePath = path.join(uploadsDir, 'sample.txt');
  fs.writeFileSync(sampleFilePath, 'This is a sample file for testing purposes.\nIt contains sensitive information like API_KEY=secret1234');
  
  // Create .htaccess file to demonstrate path traversal
  const htaccessPath = path.join(uploadsDir, '.htaccess');
  fs.writeFileSync(htaccessPath, 'AuthType Basic\nAuthName "Restricted Area"\nAuthUserFile /etc/apache2/.htpasswd\nRequire valid-user');
  
  // Create a config file to demonstrate file leakage
  const configPath = path.join(uploadsDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify({
    database: {
      host: 'localhost',
      user: 'dbuser',
      password: 'dbpass123',
      name: 'kurukshetra'
    },
    api: {
      key: 'secret-api-key-1234567890',
      endpoint: 'https://api.example.com'
    }
  }, null, 2));
  
  // Add files to database
  db.run(
    'INSERT INTO files (user_id, filename, path, type, size) VALUES (?, ?, ?, ?, ?)',
    [1, 'sample.txt', `/uploads/sample.txt`, 'text/plain', fs.statSync(sampleFilePath).size]
  );
  
  db.run(
    'INSERT INTO files (user_id, filename, path, type, size) VALUES (?, ?, ?, ?, ?)',
    [1, 'config.json', `/uploads/config.json`, 'application/json', fs.statSync(configPath).size]
  );
  
  logAction('Sample files created');
};

// Initialize security questions
const initializeSecurityQuestions = () => {
  // Create security_questions table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS security_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  
  // Clear existing security questions
  db.run('DELETE FROM security_questions', (err) => {
    if (err) console.error('Error removing security questions:', err.message);
  });
  
  // Insert sample security questions
  const questions = [
    {
      user_id: 1,
      question: "What was your first pet's name?",
      answer: "fluffy"
    },
    {
      user_id: 1,
      question: "What city were you born in?",
      answer: "london"
    },
    {
      user_id: 2,
      question: "What is your mother's maiden name?",
      answer: "smith"
    },
    {
      user_id: 2,
      question: "What was your first car?",
      answer: "honda"
    }
  ];
  
  questions.forEach(q => {
    db.run(
      'INSERT INTO security_questions (user_id, question, answer) VALUES (?, ?, ?)',
      [q.user_id, q.question, q.answer]
    );
  });
  
  logAction('Security questions created');
};

// Initialize vulnerability progress tracking
const initializeVulnerabilityProgress = () => {
  // Create vulnerability_progress table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS vulnerability_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT NOT NULL,
      vulnerability TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  
  // Clear existing progress
  db.run('DELETE FROM vulnerability_progress', (err) => {
    if (err) console.error('Error removing vulnerability progress:', err.message);
  });
  
  // Initialize with all vulnerabilities as uncompleted
  const categories = {
    'A01': ['IDOR', 'CSRF', 'Missing Function Level Control', 'JWT in localStorage', 'CORS Misconfiguration'],
    'A02': ['Weak Password Storage', 'Insecure Cookies', 'Hardcoded Secrets', 'Sensitive Data Exposure', 'JWT Algorithm None'],
    'A03': ['SQL Injection', 'NoSQL Injection', 'Command Injection', 'XSS', 'XXE', 'Path Traversal'],
    'A04': ['Weak Password Reset', 'Excessive Data Exposure', 'Rate Limiting Bypass', 'Insecure Security Questions'],
    'A05': ['Revealing Error Messages', 'Default Credentials', 'Debug Features', 'Missing Security Headers', 'Directory Listing'],
    'A06': ['Outdated Dependencies', 'Vulnerable File Upload'],
    'A07': ['Weak Password Requirements', 'Insufficient Authentication', 'Session Fixation', 'User Enumeration', 'MFA Bypass'],
    'A08': ['Unverified Updates', 'Insecure Deserialization', 'Running as Root'],
    'A09': ['Insufficient Logging', 'Error Information Exposure', 'No Intrusion Detection', 'Log Injection'],
    'A10': ['URL Validation Bypass', 'Webhook Misconfiguration']
  };
  
  Object.entries(categories).forEach(([category, vulnerabilities]) => {
    vulnerabilities.forEach(vulnerability => {
      db.run(
        'INSERT INTO vulnerability_progress (user_id, category, vulnerability, completed) VALUES (?, ?, ?, ?)',
        [2, category, vulnerability, 0]
      );
    });
  });
  
  logAction('Vulnerability progress tracking initialized');
};

// Run setup if called directly
if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  initializeDemoData();
  process.exit(0);
}

module.exports = {
  initializeDemoData
};
