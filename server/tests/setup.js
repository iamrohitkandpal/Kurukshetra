require('dotenv').config();
const { db } = require('./config/db');

beforeAll(async () => {
  // Initialize test database
  await db.run('BEGIN TRANSACTION');
});

afterAll(async () => {
  // Rollback test database changes
  await db.run('ROLLBACK');
  await db.close();
});