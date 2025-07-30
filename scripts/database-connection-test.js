const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

console.log('🔍 Kurukshetra Database Connection Test Suite');
console.log('==============================================\n');

let testResults = {
  sqlite: { connected: false, operations: 0, errors: [] },
  mongodb: { connected: false, operations: 0, errors: [] }
};

// Test SQLite Connection
async function testSQLiteConnection() {
  console.log('📊 Testing SQLite Connection...');
  console.log('-'.repeat(40));
  
  try {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    
    // Test in-memory database first
    const db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });
    
    console.log('✅ SQLite driver loaded successfully');
    testResults.sqlite.operations++;
    
    // Create test table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS test_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Test table created successfully');
    testResults.sqlite.operations++;
    
    // Insert test data
    const testUser = {
      id: crypto.randomBytes(16).toString('hex'),
      username: 'test_user',
      email: 'test@kurukshetra.dev',
      password: 'test_password'
    };
    
    await db.run(
      'INSERT INTO test_users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [testUser.id, testUser.username, testUser.email, testUser.password]
    );
    console.log('✅ Test data inserted successfully');
    testResults.sqlite.operations++;
    
    // Query test data
    const user = await db.get('SELECT * FROM test_users WHERE username = ?', testUser.username);
    if (user && user.email === testUser.email) {
      console.log('✅ Test data retrieved successfully');
      testResults.sqlite.operations++;
    } else {
      throw new Error('Data retrieval failed - data mismatch');
    }
    
    // Test search functionality (for injection testing)
    const searchResults = await db.all(
      `SELECT username, email FROM test_users WHERE username LIKE '%${testUser.username}%'`
    );
    if (searchResults.length > 0) {
      console.log('✅ Search functionality working (injection-ready)');
      testResults.sqlite.operations++;
    }
    
    // Clean up
    await db.close();
    console.log('✅ SQLite connection closed properly');
    testResults.sqlite.operations++;
    
    testResults.sqlite.connected = true;
    console.log(`🎉 SQLite: All ${testResults.sqlite.operations} operations successful!\n`);
    
  } catch (error) {
    console.error('❌ SQLite Connection Failed:', error.message);
    testResults.sqlite.errors.push(error.message);
    
    // Check for common issues
    if (error.message.includes('sqlite3')) {
      console.log('💡 Hint: Install sqlite3 with: npm install sqlite3');
    }
    console.log();
  }
}

// Test MongoDB Connection
async function testMongoDBConnection() {
  console.log('📊 Testing MongoDB Connection...');
  console.log('-'.repeat(40));
  
  try {
    const mongoose = require('mongoose');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra';
    console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Connect with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ MongoDB connection established');
    testResults.mongodb.operations++;
    
    // Define test schema
    const testUserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      flagsFound: { type: [String], default: [] },
      profile: { type: Object, default: {} },
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestUser = mongoose.models.TestUser || mongoose.model('TestUser', testUserSchema);
    console.log('✅ Test model created successfully');
    testResults.mongodb.operations++;
    
    // Clear any existing test data
    await TestUser.deleteMany({ username: /^test_user/ });
    
    // Insert test data
    const testUser = new TestUser({
      username: 'test_user_mongo',
      email: 'test@kurukshetra.dev',
      password: 'test_password',
      flagsFound: ['test-flag'],
      profile: { department: 'Testing', clearanceLevel: 'PUBLIC' }
    });
    
    await testUser.save();
    console.log('✅ Test data inserted successfully');
    testResults.mongodb.operations++;
    
    // Query test data
    const user = await TestUser.findOne({ username: 'test_user_mongo' });
    if (user && user.email === 'test@kurukshetra.dev') {
      console.log('✅ Test data retrieved successfully');
      testResults.mongodb.operations++;
    } else {
      throw new Error('Data retrieval failed - data mismatch');
    }
    
    // Test aggregation (for NoSQL injection testing)
    const aggregationResult = await TestUser.aggregate([
      { $match: { username: 'test_user_mongo' } },
      { $project: { username: 1, email: 1, flagsFound: 1 } }
    ]);
    
    if (aggregationResult.length > 0) {
      console.log('✅ Aggregation pipeline working (NoSQL injection-ready)');
      testResults.mongodb.operations++;
    }
    
    // Test search functionality
    const searchResults = await TestUser.find({
      $or: [
        { username: { $regex: 'test_user', $options: 'i' } },
        { email: { $regex: 'test', $options: 'i' } }
      ]
    });
    
    if (searchResults.length > 0) {
      console.log('✅ Search functionality working');
      testResults.mongodb.operations++;
    }
    
    // Clean up test data
    await TestUser.deleteMany({ username: /^test_user/ });
    console.log('✅ Test data cleaned up');
    testResults.mongodb.operations++;
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed properly');
    testResults.mongodb.operations++;
    
    testResults.mongodb.connected = true;
    console.log(`🎉 MongoDB: All ${testResults.mongodb.operations} operations successful!\n`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    testResults.mongodb.errors.push(error.message);
    
    // Check for common issues
    if (error.message.includes('ENOTFOUND') || error.message.includes('connect')) {
      console.log('💡 Hint: Check your MONGODB_URI in .env.local');
      console.log('💡 Ensure MongoDB Atlas IP whitelist includes your IP');
    }
    if (error.message.includes('authentication failed')) {
      console.log('💡 Hint: Check your MongoDB username and password');
    }
    if (error.message.includes('serverSelectionTimeoutMS')) {
      console.log('💡 Hint: MongoDB server is not reachable (network/firewall issue)');
    }
    console.log();
  }
}

// Test environment configuration
function testEnvironmentConfig() {
  console.log('⚙️  Testing Environment Configuration...');
  console.log('-'.repeat(40));
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('💡 Create .env.local file with database configuration');
    return false;
  }
  
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check required variables
  const requiredVars = ['DB_TYPE', 'JWT_SECRET'];
  const optionalVars = ['MONGODB_URI', 'NEXT_PUBLIC_LEAKED_API_KEY'];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Missing (required)`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`⚠️  ${varName}: Missing (recommended)`);
    }
  });
  
  // Check current DB_TYPE setting
  const dbTypeMatch = envContent.match(/DB_TYPE=(.+)/);
  if (dbTypeMatch) {
    const currentDbType = dbTypeMatch[1].trim();
    console.log(`📊 Current DB_TYPE: ${currentDbType}`);
    
    if (!['sqlite', 'mongo'].includes(currentDbType)) {
      console.log('⚠️  Invalid DB_TYPE. Should be "sqlite" or "mongo"');
    }
  }
  
  console.log();
  return allRequired;
}

// Test database switching functionality
async function testDatabaseSwitching() {
  console.log('🔄 Testing Database Switching Functionality...');
  console.log('-'.repeat(40));
  
  try {
    // Test if the switching logic exists
    const dbPath = path.join(process.cwd(), 'src/lib/db.ts');
    
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database abstraction layer not found at src/lib/db.ts');
      return false;
    }
    
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    
    // Check for switching logic
    if (dbContent.includes('DB_TYPE')) {
      console.log('✅ Database type switching logic found');
    } else {
      console.log('❌ Database type switching logic not found');
      return false;
    }
    
    // Check for both database implementations
    if (dbContent.includes('sqlite') && dbContent.includes('mongo')) {
      console.log('✅ Both SQLite and MongoDB implementations found');
    } else {
      console.log('⚠️  Missing database implementation(s)');
    }
    
    // Check for unified API
    const expectedFunctions = [
      'findUserByEmail',
      'findUserByUsername', 
      'createUser',
      'searchUsers'
    ];
    
    let allFunctionsFound = true;
    expectedFunctions.forEach(func => {
      if (dbContent.includes(func)) {
        console.log(`✅ ${func}: Function implemented`);
      } else {
        console.log(`❌ ${func}: Function missing`);
        allFunctionsFound = false;
      }
    });
    
    console.log();
    return allFunctionsFound;
    
  } catch (error) {
    console.error('❌ Database switching test failed:', error.message);
    console.log();
    return false;
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting comprehensive database tests...\n');
  
  // Test environment configuration first
  const envConfigValid = testEnvironmentConfig();
  
  // Test database switching logic
  const switchingWorking = await testDatabaseSwitching();
  
  // Test both database connections
  await testSQLiteConnection();
  await testMongoDBConnection();
  
  // Generate final report
  console.log('📊 FINAL TEST REPORT');
  console.log('='.repeat(50));
  
  console.log('\n🔧 Environment Configuration:');
  console.log(`   Status: ${envConfigValid ? '✅ Valid' : '❌ Issues found'}`);
  
  console.log('\n🔄 Database Switching:');
  console.log(`   Status: ${switchingWorking ? '✅ Working' : '❌ Issues found'}`);
  
  console.log('\n📊 SQLite Database:');
  console.log(`   Connection: ${testResults.sqlite.connected ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Operations: ${testResults.sqlite.operations}/6 completed`);
  if (testResults.sqlite.errors.length > 0) {
    console.log(`   Errors: ${testResults.sqlite.errors.join(', ')}`);
  }
  
  console.log('\n📊 MongoDB Database:');
  console.log(`   Connection: ${testResults.mongodb.connected ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Operations: ${testResults.mongodb.operations}/8 completed`);
  if (testResults.mongodb.errors.length > 0) {
    console.log(`   Errors: ${testResults.mongodb.errors.join(', ')}`);
  }
  
  // Overall status
  const overallStatus = envConfigValid && switchingWorking && 
    (testResults.sqlite.connected || testResults.mongodb.connected);
  
  console.log('\n🎯 OVERALL STATUS:');
  if (overallStatus) {
    console.log('✅ Database system is ready for Kurukshetra training!');
    console.log('🚀 You can now run vulnerability demonstrations.');
    
    if (testResults.sqlite.connected && testResults.mongodb.connected) {
      console.log('🌟 Both databases working - full SQL/NoSQL injection demos available!');
    } else if (testResults.sqlite.connected) {
      console.log('📊 SQLite working - SQL injection demos available');
      console.log('⚠️  MongoDB not available - NoSQL demos limited');
    } else if (testResults.mongodb.connected) {
      console.log('📊 MongoDB working - NoSQL injection demos available');
      console.log('⚠️  SQLite not available - SQL demos limited');
    }
  } else {
    console.log('❌ Database system has critical issues');
    console.log('📝 Please fix the issues above before running Kurukshetra');
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Set exit code based on results
  process.exit(overallStatus ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('💥 Test suite crashed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };