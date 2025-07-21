#!/usr/bin/env node
/**
 * Kurukshetra - Comprehensive Database Seeding Script
 * Automatically populates the database with realistic testing data for OWASP Top 10 vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { initializeDatabase, getDatabase } = require('../src/lib/db');
let db;
let isMongoDb = false;

async function getUserCount() {
  const database = await getDatabase();
  if (database.type === 'mongo') {
    return await database.UserModel.countDocuments();
  } else {
    const result = await database.instance.get('SELECT COUNT(*) as count FROM users');
    return result.count;
  }
}

async function createUser(userData) {
  const id = crypto.randomBytes(16).toString('hex');
  const database = await getDatabase();
  
  if (database.type === 'mongo') {
    const user = new database.UserModel({
      ...userData,
      _id: id
    });
    await user.save();
    return user;
  } else {
    await database.instance.run(`
      INSERT INTO users (id, username, email, password, flagsFound, role, createdAt, isActive, profile) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userData.username,
      userData.email,
      userData.password,
      JSON.stringify(userData.flagsFound || []),
      userData.role || 'user',
      new Date().toISOString(),
      userData.isActive !== false ? 1 : 0,
      JSON.stringify(userData.profile || {})
    ]);
    return { id, ...userData };
  }
}

// Comprehensive test data for OWASP Top 10 vulnerabilities
const testUsers = [
  // Admin users for access control testing
  {
    username: 'admin',
    email: 'admin@kurukshetra.dev',
    password: 'FLAG{P4ssw0rd_1n_Pl41nt3xt!}', // A07: Auth failures - plaintext password
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
  
  // Regular users for horizontal privilege escalation testing
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
    password: 'admin', // Common weak password
    role: 'user',
    flagsFound: [],
    profile: { department: 'Finance', clearanceLevel: 'RESTRICTED', ssn: '555-12-3456' }
  },
  
  // Users for credential stuffing and enumeration attacks
  {
    username: 'david_miller',
    email: 'david@company.com',
    password: '12345678',
    role: 'user',
    flagsFound: ['misconfiguration'],
    profile: { department: 'HR', clearanceLevel: 'INTERNAL' }
  },
  {
    username: 'eve_davis',
    email: 'eve@company.com',
    password: 'password',
    role: 'user',
    flagsFound: ['vulnerable-dependencies'],
    profile: { department: 'Legal', clearanceLevel: 'CONFIDENTIAL' }
  },
  {
    username: 'frank_johnson',
    email: 'frank@enterprise.org',
    password: 'frank123',
    role: 'user',
    flagsFound: ['ssrf'],
    profile: { department: 'Operations', clearanceLevel: 'SECRET' }
  },
  
  // Test accounts with various patterns for injection testing
  {
    username: 'grace_hopper',
    email: 'grace@legacy.mil',
    password: 'legacy_system_2023',
    role: 'user',
    flagsFound: ['insecure-design'],
    profile: { department: 'R&D', clearanceLevel: 'TOP_SECRET' }
  },
  {
    username: 'henry_ford',
    email: 'henry@automotive.com',
    password: 'Model-T-1908',
    role: 'user',
    flagsFound: ['data-integrity-failures'],
    profile: { department: 'Manufacturing', clearanceLevel: 'PROPRIETARY' }
  },
  
  // Accounts for session management testing
  {
    username: 'iris_watson',
    email: 'iris@clinic.health',
    password: 'medical_records_secure',
    role: 'user',
    flagsFound: ['logging-failures'],
    profile: { department: 'Healthcare', clearanceLevel: 'HIPAA_PROTECTED' }
  },
  {
    username: 'jack_sparrow',
    email: 'jack@pirates.ship',
    password: 'blackpearl',
    role: 'user',
    flagsFound: [],
    profile: { department: 'Maritime', clearanceLevel: 'PIRATE' }
  },
  
  // Service accounts and API users
  {
    username: 'service_account',
    email: 'service@kurukshetra.dev', // Match demo credentials
    password: 'Service@2024!', // Match demo credentials
    role: 'service',
    flagsFound: [],
    profile: { department: 'System', clearanceLevel: 'SYSTEM_INTERNAL' }
  },
  {
    username: 'legacy_service',
    email: 'service@internal.api',
    password: 'service_key_12345',
    role: 'service',
    flagsFound: [],
    profile: { department: 'Legacy', clearanceLevel: 'SYSTEM_INTERNAL' }
  },
  {
    username: 'api_gateway',
    email: 'gateway@api.internal',
    password: 'gateway_secret_token',
    role: 'api',
    flagsFound: [],
    profile: { department: 'Infrastructure', clearanceLevel: 'API_ACCESS' }
  },
  
  // Test accounts with SQL injection friendly names
  {
    username: 'test_user_1',
    email: 'test1@injection.test',
    password: 'test123',
    role: 'user',
    flagsFound: [],
    profile: { department: 'QA', clearanceLevel: 'TEST_ONLY' }
  },
  {
    username: 'test_user_2',
    email: 'test2@injection.test',
    password: 'test456',
    role: 'user',
    flagsFound: [],
    profile: { department: 'QA', clearanceLevel: 'TEST_ONLY' }
  },
  
  // Accounts with interesting data for exfiltration
  {
    username: 'finance_manager',
    email: 'finance@company.corp',
    password: 'Q4_earnings_2023',
    role: 'manager',
    flagsFound: [],
    profile: { 
      department: 'Finance', 
      clearanceLevel: 'FINANCIAL_DATA',
      creditCard: '4532-1234-5678-9012',
      bankAccount: 'ACC-789012345'
    }
  },
  {
    username: 'hr_director',
    email: 'hr@company.corp',
    password: 'employee_database',
    role: 'manager',
    flagsFound: [],
    profile: { 
      department: 'Human Resources', 
      clearanceLevel: 'PII_ACCESS',
      employeeCount: 1337,
      salaryBudget: '$2,500,000'
    }
  },
  
  // Disabled/inactive accounts for testing
  {
    username: 'former_employee',
    email: 'former@company.com',
    password: 'should_be_disabled',
    role: 'user',
    isActive: false,
    flagsFound: [],
    profile: { department: 'TERMINATED', clearanceLevel: 'REVOKED' }
  },
  {
    username: 'contractor_temp',
    email: 'temp@contractor.external',
    password: 'temp_access_2023',
    role: 'contractor',
    flagsFound: [],
    profile: { department: 'External', clearanceLevel: 'LIMITED_ACCESS' }
  }
];

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
