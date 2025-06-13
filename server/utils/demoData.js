const { db } = require("../config/db");
const md5 = require("md5");

// Remove top-level await and wrap in function
const initializeTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT,
          email TEXT,
          password TEXT,
          role TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          description TEXT,
          price REAL,
          category TEXT,
          stock INTEGER
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT,
          rating INTEGER,
          user_id INTEGER,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

const createDemoData = async () => {
  try {
    await initializeTables();

    // Demo Users
    const users = [
      {
        username: "admin",
        email: "admin@vulnerable.app",
        password: md5("admin123"),
        role: "admin",
      },
      {
        username: "user",
        email: "user@vulnerable.app",
        password: md5("password123"),
        role: "user",
      }
    ];

    // Demo Products
    const products = [
      {
        name: "Vulnerable Router",
        description: "A router with known security flaws",
        price: 99.99,
        category: "network",
        stock: 10,
      },
      {
        name: "Outdated Server",
        description: "Server running legacy software",
        price: 499.99,
        category: "servers",
        stock: 5,
      }
    ];

    // Demo Feedback
    const feedback = [
      {
        content: '<script>alert("XSS")</script>',
        rating: 4,
        user_id: 1,
      },
      {
        content: '<img src=x onerror=alert("Hacked")>',
        rating: 3,
        user_id: 2,
      }
    ];

    // Insert data using promises
    const insertData = async () => {
      for (const user of users) {
        await new Promise((resolve, reject) => {
          db.run(
            "INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [user.username, user.email, user.password, user.role],
            (err) => err ? reject(err) : resolve()
          );
        });
      }

      for (const product of products) {
        await new Promise((resolve, reject) => {
          db.run(
            "INSERT OR IGNORE INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)",
            [product.name, product.description, product.price, product.category, product.stock],
            (err) => err ? reject(err) : resolve()
          );
        });
      }

      for (const item of feedback) {
        await new Promise((resolve, reject) => {
          db.run(
            "INSERT OR IGNORE INTO feedback (content, rating, user_id) VALUES (?, ?, ?)",
            [item.content, item.rating, item.user_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    };

    await insertData();
    console.log("Demo data created successfully");
  } catch (err) {
    console.error("Error creating demo data:", err);
    throw err;
  }
};

module.exports = { createDemoData };
