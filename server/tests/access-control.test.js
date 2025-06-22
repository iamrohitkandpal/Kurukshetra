const request = require('supertest');
const app = require('../server');

describe('Access Control Vulnerabilities', () => {
  let userToken, adminToken;

  beforeAll(async () => {
    // Create test user and admin
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    userToken = userRes.body.token;
  });

  test('IDOR in User Profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ id: 2 }); // Try to access another user's profile
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
  });

  test('Role Bypass via Header', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-admin-override', 'true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Mass Assignment in Profile Update', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        role: 'admin', // Try to escalate privileges
        username: 'hacked'
      });
    expect(res.status).toBe(200);
  });

  test('Path Traversal in File Download', async () => {
    const res = await request(app)
      .get('/api/files/../../../etc/passwd')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).not.toBe(404);
  });
});