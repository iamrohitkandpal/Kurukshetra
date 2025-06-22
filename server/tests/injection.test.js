const request = require('supertest');
const app = require('../server');
const { Product } = require('../models');

describe('SQL/NoSQL Injection Vulnerabilities', () => {
  let authToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    authToken = loginRes.body.token;
  });

  test('SQL Injection in Product Search', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ search: "'; DROP TABLE Products; --" });
    expect(res.status).toBe(500); // Should error but not drop table
  });

  test('NoSQL Injection in MongoDB Mode', async () => {
    // Switch to MongoDB
    await request(app)
      .post('/api/db/switch')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'mongodb' });

    const res = await request(app)
      .get('/api/products')
      .query({ 
        search: '{"$gt": ""}',
        category: '{"$ne": null}'
      });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('XSS in Feedback', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: xssPayload,
        rating: 5
      });
    expect(res.status).toBe(201);
    expect(res.body.html).toBe(xssPayload); // Raw HTML stored
  });
});