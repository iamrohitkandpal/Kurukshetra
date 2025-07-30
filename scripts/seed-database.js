#!/usr/bin/env node
/**
 * Kurukshetra - Comprehensive Database Seeding Script
 * Automatically populates the database with realistic testing data for OWASP Top 10 vulnerabilities
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

let db;
let isMongoDb = false;
let mongoose;
let UserModel;

async function initializeDatabase() {
  const DB_TYPE = process.env.DB_TYPE || "sqlite";
  isMongoDb = DB_TYPE === "mongo";

  if (isMongoDb) {
    mongoose = require("mongoose");
    // FIXED: Changed 'mongori' to 'mongoUri'
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/kurukshetra";

    try {
      await mongoose.connect(mongoUri);
      console.log("📊 Connected to MongoDB");

      const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "user" },
        flagsFound: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        profile: { type: Object, default: {} },
      });

      UserModel = mongoose.models.User || mongoose.model("User", userSchema);
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error.message);
      throw error;
    }
  } else {
    const sqlite3 = require("sqlite3");
    const { open } = require("sqlite");

    try {
      const dbPath =
        process.env.NODE_ENV === "production"
          ? path.join(process.cwd(), "kurukshetra.db")
          : ":memory:";
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      console.log("📊 Connected to SQLite");

      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          flagsFound TEXT DEFAULT '[]',
          isActive BOOLEAN DEFAULT 1,
          profile TEXT DEFAULT '{}',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("❌ Error connecting to SQLite:", error.message);
      throw error;
    }
  }
}

async function getUserCount() {
  if (isMongoDb) {
    return await UserModel.countDocuments();
  } else {
    const result = await db.get("SELECT COUNT(*) as count FROM users");
    return result.count;
  }
}

async function createUser(userData) {
  const id = crypto.randomBytes(16).toString("hex");

  if (isMongoDb) {
    const user = new UserModel({
      ...userData,
      flagsFound: userData.flagsFound || [],
      profile: userData.profile || {},
    });
    await user.save();
    return user;
  } else {
    await db.run(
      `
      INSERT INTO users (id, username, email, password, role, flagsFound, isActive, profile, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        userData.username,
        userData.email,
        userData.password,
        userData.role || "user",
        JSON.stringify(userData.flagsFound || []),
        userData.isActive !== false ? 1 : 0,
        JSON.stringify(userData.profile || {}),
        new Date().toISOString(),
      ]
    );
    return { id, ...userData };
  }
}

const testUsers = [
  {
    username: 'admin',
    email: 'admin@kurukshetra.dev',
    password: 'FLAG{P4ssw0rd_1n_Pl41nt3xt!}',
    role: 'admin',
    flagsFound: [],
    profile: { department: 'Security', clearanceLevel: 'TOP_SECRET' }
  },
  {
    username: 'superadmin',
    email: 'superadmin@kurukshetra.dev',
    password: 'SuperAdmin123!',
    role: 'superadmin',
    flagsFound: ['insecure-auth', 'access-control-flaws'],
    profile: { department: 'IT', clearanceLevel: 'ULTRA_SECRET' }
  },
  {
    username: 'alice_cooper',
    email: 'alice@example.com',
    password: 'password123',
    role: 'user',
    flagsFound: ['crypto-weakness'],
    profile: { department: 'Engineering', clearanceLevel: 'CONFIDENTIAL', ssn: '123-45-6789' }
  },
  {
    username: 'bob_wilson',
    email: 'bob@example.com',
    password: 'qwerty456',
    role: 'user',
    flagsFound: ['injection-vulnerabilities'],
    profile: { department: 'Marketing', clearanceLevel: 'PUBLIC', ssn: '987-65-4321' }
  },
  {
    username: 'charlie_brown',
    email: 'charlie@example.com',
    password: 'admin',
    role: 'user',
    flagsFound: [],
    profile: { department: 'Finance', clearanceLevel: 'RESTRICTED', ssn: '555-12-3456' }
  },
]

async function seedDatabase() {
  console.log('🌱 Starting Kurukshetra database seeding...\n');
  
  try {
    await initializeDatabase();
    
    const currentCount = await getUserCount();
    console.log(`📊 Current user count: ${currentCount}`);
    
    if (currentCount >= 20) {
      console.log('✅ Database already has sufficient test data (≥20 users)');
      console.log('🎯 Seeding skipped to maintain performance');
      return;
    }
    
    console.log('🔄 Adding comprehensive OWASP Top 10 test data...\n');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const userData of testUsers) {
      try {
        await createUser(userData);
        console.log(`✅ Created user: ${userData.username} (${userData.role})`);
        createdCount++;
      } catch (error) {
        if (error.message.includes('UNIQUE') || error.message.includes('duplicate')) {
          console.log(`⚠️  Skipped existing user: ${userData.username}`);
          skippedCount++;
        } else {
          console.error(`❌ Failed to create user ${userData.username}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Created: ${createdCount} new users`);
    console.log(`   • Skipped: ${skippedCount} existing users`);
    console.log(`   • Total: ${await getUserCount()} users in database`);
    
    console.log('\n🎯 OWASP Top 10 Testing Scenarios Ready:');
    console.log('   • A01: Broken Access Control - Multiple user roles and permissions');
    console.log('   • A02: Cryptographic Failures - Plaintext passwords and weak encryption');
    console.log('   • A03: Injection - SQL/NoSQL injection test accounts');
    console.log('   • A04: Insecure Design - Business logic flaws');
    console.log('   • A05: Security Misconfiguration - Default and weak configurations');
    console.log('   • A06: Vulnerable Components - Dependency vulnerabilities');
    console.log('   • A07: Authentication Failures - Weak authentication mechanisms');
    console.log('   • A08: Software & Data Integrity - Data integrity violations');
    console.log('   • A09: Logging & Monitoring - Insufficient security logging');
    console.log('   • A10: SSRF - Server-side request forgery vulnerabilities');
    
    console.log('\n🚀 Ready for ethical hacking practice!');
    
  } catch (error) {
    console.error('💥 Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Auto-seed on build if this script is run directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = { seedDatabase, testUsers };