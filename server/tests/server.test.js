const request = require('supertest');
const app = require('../server');
const { db } = require('../config/db');
const jwt = require('jsonwebtoken');

describe('Server API Tests', () => {
  let authToken;
  let adminToken;

  // Setup test tokens before all tests
  beforeAll(async () => {
    // Create tokens for testing
    authToken = jwt.sign(
      { userId: 2, username: 'user', role: 'user' },
      process.env.JWT_SECRET || 'insecure_jwt_secret'
    );

    adminToken = jwt.sign(
      { userId: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'insecure_jwt_secret'
    );
  });

  // Authentication Tests
  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - Should register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered');
    });

    test('POST /api/auth/login - Should login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/auth/reset-password - Should send reset email', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(200);
    });
  });

  // Vulnerability Tests
  describe('OWASP Top 10 Vulnerabilities', () => {
    // A01: Broken Access Control
    test('IDOR Vulnerability Test', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('x-auth-token', authToken);
      expect(res.statusCode).toBe(200);
    });

    // A02: Cryptographic Failures
    test('Password Storage Test', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'cryptotest',
          email: 'crypto@test.com',
          password: 'testpass123'
        });
      const user = await db.get('SELECT password FROM users WHERE username = ?', ['cryptotest']);
      expect(user.password).toMatch(/^[a-f0-9]{32}$/); // MD5 hash format
    });

    // A03: Injection Tests
    test('SQL Injection Vulnerability', async () => {
      const res = await request(app)
        .get("/api/products/1' OR '1'='1")
        .set('x-auth-token', authToken);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });

    // A04: Insecure Design
    test('Rate Limiting Bypass', async () => {
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'wrongpass'
          });
        expect(res.statusCode).toBe(401);
      }
    });

    // A05: Security Misconfiguration
    test('Debug Information Exposure', async () => {
      const res = await request(app)
        .get('/debug/users')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('query');
    });

    // A06: Vulnerable Components
    test('File Upload Vulnerability', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .set('x-auth-token', authToken)
        .attach('file', 'test.php');
      expect(res.statusCode).toBe(200);
    });

    // A07: Authentication Failures
    test('Weak Password Acceptance', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'weakpass',
          email: 'weak@test.com',
          password: '123'
        });
      expect(res.statusCode).toBe(201);
    });

    // A08: Software and Data Integrity
    test('Insecure Deserialization', async () => {
      const res = await request(app)
        .post('/api/import/config')
        .set('x-auth-token', adminToken)
        .send({
          config: '{"constructor":{"prototype":{"polluted":"yes"}}}'
        });
      expect(res.statusCode).toBe(200);
    });

    // A09: Logging and Monitoring
    test('Insufficient Error Logging', async () => {
      const res = await request(app)
        .get('/api/admin/logs')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    // A10: SSRF
    test('SSRF Vulnerability', async () => {
      const res = await request(app)
        .post('/api/webhooks/test')
        .set('x-auth-token', authToken)
        .send({
          url: 'http://localhost:5000/internal'
        });
      expect(res.statusCode).toBe(200);
    });
  });

  // API Endpoint Tests
  describe('API Endpoints', () => {
    test('GET /api/products - Should return products list', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /api/products/:id - Should return single product', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
    });

    test('POST /api/feedback - Should submit feedback', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('x-auth-token', authToken)
        .send({
          content: 'Test feedback',
          rating: 5
        });
      expect(res.statusCode).toBe(201);
    });
  });
});
