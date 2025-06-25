const request = require('supertest');
const app = require('../server');
const dbManager = require('../config/dbManager');

describe('Authentication Vulnerabilities', () => {
  let token;

  beforeAll(async () => {
    const models = dbManager.getCurrentModels();
    await models.User.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@test.com'
    });
  });

  test('SQL Injection in Login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: "' OR '1'='1",
        password: "' OR '1'='1"
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Weak Password Hash (MD5)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        password: 'password123',
        email: 'new@test.com'
      });
    expect(res.status).toBe(201);
    const user = await User.findOne({ username: 'newuser' });
    expect(user.password).toMatch(/^[a-f0-9]{32}$/); // MD5 hash pattern
  });

  test('Predictable Reset Token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('resetToken');
    expect(typeof res.body.resetToken).toBe('string');
  });
});