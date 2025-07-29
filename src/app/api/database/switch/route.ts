// src/app/api/database/switch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';

// Seed data example for both SQLite and MongoDB
const seedData = {
  users: [
    { username: 'admin', email: 'admin@kurukshetra.dev', password: 'FLAG{P4ssw0rd_1n_Pl41nt3xt!}', role: 'admin', flagsFound: ['access-control-flaws'] },
    { username: 'superadmin', email: 'superadmin@kurukshetra.dev', password: 'SuperAdmin123!', role: 'superadmin', flagsFound: ['insecure-auth'] },
    { username: 'user', email: 'user@example.com', password: 'user123', role: 'user', flagsFound: [] }
  ]
};

async function seedSQLite() {
  const db = await open({
    filename: process.env.NODE_ENV === 'production' ? 'kurukshetra.db' : ':memory:',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      flagsFound TEXT,
      role TEXT DEFAULT 'user'
    );
  `);

  await db.run('DELETE FROM users'); // Clear existing data

  for (const user of seedData.users) {
    await db.run(
      `INSERT INTO users (id, username, email, password, flagsFound, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [randomBytes(16).toString('hex'), user.username, user.email, user.password, JSON.stringify(user.flagsFound), user.role]
    );
  }

  const count = await db.get('SELECT COUNT(*) as count FROM users');
  return count.count;
}

async function seedMongoDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra';
  await mongoose.connect(mongoUri);

  const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    flagsFound: { type: [String], default: [] },
    role: { type: String, default: 'user' }
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  await User.deleteMany({}); // Clear existing data

  await User.insertMany(seedData.users);

  const count = await User.countDocuments();
  return count;
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  try {
    const { type } = body;

    if (!type || !['sqlite', 'mongo'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid database type. Must be "sqlite" or "mongo"' },
        { status: 400 }
      );
    }

    // Update .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.error('Failed to read .env.local:', error);
      return NextResponse.json(
        { message: 'Failed to read environment configuration' },
        { status: 500 }
      );
    }

    const dbTypeRegex = /^DB_TYPE=.*/gm;
    const newDbType = `DB_TYPE=${type}`;

    if (dbTypeRegex.test(envContent)) {
      envContent = envContent.replace(dbTypeRegex, newDbType);
    } else {
      envContent = `${newDbType}\n${envContent}`;
    }

    try {
      fs.writeFileSync(envPath, envContent);
    } catch (error) {
      console.error('Failed to write .env.local:', error);
      return NextResponse.json(
        { message: 'Failed to update environment configuration' },
        { status: 500 }
      );
    }

    process.env.DB_TYPE = type;
    let count;

    if (type === 'sqlite') {
      count = await seedSQLite();
    } else {
      count = await seedMongoDB();
    }

    return NextResponse.json({
      message: `Database switched to ${type} with ${count} users`,
      type: type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database switch failed:', error);
    return NextResponse.json(
      { message: 'Failed to switch database' },
      { status: 500 }
    );
  }
}
