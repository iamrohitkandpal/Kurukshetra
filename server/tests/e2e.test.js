// server/tests/e2e.test.js
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

describe('Backend E2E Tests', () => {
  let userToken;
  let adminToken;
  let testUserId;
  let testProductId;
  let testFileId;
  let testWebhookId;

  beforeAll(async () => {
    // Create tokens for testing
    userToken = jwt.sign(
      { userId: 2, username: 'testuser', role: 'user' },
      process.env.JWT_SECRET || 'test_secret'
    );

    adminToken = jwt.sign(
      { userId: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

  // Database Tests
  describe('Database Operations', () => {
    test('Should switch database type', async () => {
      const res = await request(app)
        .post('/api/db/switch')
        .send({ type: 'sqlite' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBeTruthy();
    });

    test('Should get current database type', async () => {
      const res = await request(app).get('/api/db/type');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('type');
    });
  });

  // Authentication Tests
  describe('Authentication', () => {
    test('Should register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@123'
        });
      expect(res.statusCode).toBe(201);
      testUserId = res.body.userId;
    });

    test('Should login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Test@123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('Should handle password reset request', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(200);
    });
  });

  // User Operations Tests
  describe('User Operations', () => {
    test('Should get user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
    });

    test('Should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('x-auth-token', userToken)
        .send({ email: 'updated@example.com' });
      expect(res.statusCode).toBe(200);
    });

    test('Should generate API key', async () => {
      const res = await request(app)
        .post('/api/users/api-key')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
    });
  });

  // Product Tests
  describe('Product Operations', () => {
    test('Should create new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'Test'
        });
      expect(res.statusCode).toBe(201);
      testProductId = res.body.id;
    });

    test('Should get products list', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('Should get single product', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.statusCode).toBe(200);
    });
  });

  // File Operations Tests
  describe('File Operations', () => {
    test('Should upload file', async () => {
      const filePath = path.join(__dirname, 'test-files', 'test.txt');
      const res = await request(app)
        .post('/api/files/upload')
        .set('x-auth-token', userToken)
        .attach('file', filePath);
      expect(res.statusCode).toBe(201);
      testFileId = res.body.id;
    });

    test('Should list files', async () => {
      const res = await request(app)
        .get('/api/files')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Feedback Tests
  describe('Feedback Operations', () => {
    test('Should submit feedback', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('x-auth-token', userToken)
        .send({
          content: 'Test feedback',
          rating: 5
        });
      expect(res.statusCode).toBe(201);
    });

    test('Should get feedback list', async () => {
      const res = await request(app)
        .get('/api/feedback')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Webhook Tests
  describe('Webhook Operations', () => {
    test('Should create webhook', async () => {
      const res = await request(app)
        .post('/api/webhooks')
        .set('x-auth-token', userToken)
        .send({
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['user.created', 'user.updated']
        });
      expect(res.statusCode).toBe(201);
      testWebhookId = res.body.id;
    });

    test('Should list webhooks', async () => {
      const res = await request(app)
        .get('/api/webhooks')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Admin Operations Tests
  describe('Admin Operations', () => {
    test('Should get system info', async () => {
      const res = await request(app)
        .get('/api/admin/system-info')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
    });

    test('Should get system logs', async () => {
      const res = await request(app)
        .get('/api/admin/logs')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
    });

    test('Should list all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Vulnerability Tests
  describe('Security Vulnerabilities', () => {
    test('SQL Injection vulnerability', async () => {
      const res = await request(app)
        .get('/api/products?search=1%27%20OR%20%271%27=%271')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
    });

    test('NoSQL Injection vulnerability', async () => {
      const res = await request(app)
        .post('/api/nosql/login')
        .send({
          username: { $ne: null },
          password: { $ne: null }
        });
      expect(res.statusCode).toBe(200);
    });

    test('XSS vulnerability', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('x-auth-token', userToken)
        .send({
          content: '<script>alert("XSS")</script>',
          rating: 5
        });
      expect(res.statusCode).toBe(201);
    });
  });

  // Cleanup
  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('x-auth-token', adminToken);
    }

    if (testProductId) {
      await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('x-auth-token', adminToken);
    }
  });
});