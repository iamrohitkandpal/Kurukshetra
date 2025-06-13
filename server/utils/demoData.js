const { db } = require('../config/db');
const md5 = require('md5');

const createDemoData = async () => {
  // Demo Users
  const users = [
    {
      username: 'admin',
      email: 'admin@vulnerable.app',
      password: md5('admin123'),
      role: 'admin'
    },
    {
      username: 'user',
      email: 'user@vulnerable.app',
      password: md5('password123'),
      role: 'user'
    }
  ];

  // Demo Products
  const products = [
    {
      name: 'Vulnerable Router',
      description: 'A router with known security flaws',
      price: 99.99,
      category: 'network',
      stock: 10
    },
    {
      name: 'Outdated Server',
      description: 'Server running legacy software',
      price: 499.99,
      category: 'servers',
      stock: 5
    }
  ];

  // Demo Feedback with XSS payloads
  const feedback = [
    {
      content: '<script>alert("XSS")</script>',
      rating: 4,
      user_id: 1
    },
    {
      content: '<img src=x onerror=alert("Hacked")>',
      rating: 3,
      user_id: 2
    }
  ];

  try {
    // Insert Users
    for (const user of users) {
      await db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [user.username, user.email, user.password, user.role]
      );
    }

    // Insert Products
    for (const product of products) {
      await db.run(
        'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.category, product.stock]
      );
    }

    // Insert Feedback
    for (const item of feedback) {
      await db.run(
        'INSERT INTO feedback (content, rating, user_id) VALUES (?, ?, ?)',
        [item.content, item.rating, item.user_id]
      );
    }

    console.log('Demo data created successfully');
  } catch (err) {
    console.error('Error creating demo data:', err);
  }
};

module.exports = { createDemoData };