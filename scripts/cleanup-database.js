#!/usr/bin/env node
/**
 * Kurukshetra - Database Cleanup Script
 * Removes duplicate users and ensures data integrity
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// Import the centralized database initialization
const { initializeDatabase, getDatabase } = require('../src/lib/db');

// Database connection variables
let db;
let isMongoDb = false;
let UserModel;

async function setupDatabaseConnection() {
  try {
    await initializeDatabase();
    const { database, mongoose } = getDatabase();
    
    const DB_TYPE = process.env.DB_TYPE || 'sqlite';
    
    if (DB_TYPE === 'mongo') {
      isMongoDb = true;
      // Define MongoDB schema if not already defined
      const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        flagsFound: { type: [String], default: [] }
      });
      
      UserModel = mongoose.models.User || mongoose.model('User', userSchema);
      console.log('📊 Connected to MongoDB');
    } else {
      db = database;
      console.log('📊 Connected to SQLite database');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function getDatabaseStats() {
  if (isMongoDb) {
    const totalUsers = await UserModel.countDocuments();
    const uniqueUsernames = (await UserModel.distinct('username')).length;
    const uniqueEmails = (await UserModel.distinct('email')).length;
    
    return { totalUsers, uniqueUsernames, uniqueEmails };
  } else {
    const total = await db.get('SELECT COUNT(*) as count FROM users');
    const uniqueUsernames = await db.get('SELECT COUNT(DISTINCT username) as count FROM users');
    const uniqueEmails = await db.get('SELECT COUNT(DISTINCT email) as count FROM users');
    
    return {
      totalUsers: total.count,
      uniqueUsernames: uniqueUsernames.count,
      uniqueEmails: uniqueEmails.count
    };
  }
}

async function removeDuplicateUsers() {
  if (isMongoDb) {
    // Find duplicate usernames
    const duplicateUsernames = await UserModel.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    // Find duplicate emails
    const duplicateEmails = await UserModel.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    let removedCount = 0;
    
    // Remove duplicate usernames (keep first, remove rest)
    for (const duplicate of duplicateUsernames) {
      const [keep, ...remove] = duplicate.docs;
      await UserModel.deleteMany({ _id: { $in: remove } });
      removedCount += remove.length;
      console.log(`Removed ${remove.length} duplicate users with username: ${duplicate._id}`);
    }
    
    // Remove duplicate emails (keep first, remove rest)
    for (const duplicate of duplicateEmails) {
      const [keep, ...remove] = duplicate.docs;
      await UserModel.deleteMany({ _id: { $in: remove } });
      removedCount += remove.length;
      console.log(`Removed ${remove.length} duplicate users with email: ${duplicate._id}`);
    }
    
    const totalUsers = await UserModel.countDocuments();
    return { removed: removedCount, kept: totalUsers };
    
  } else {
    // Find and remove duplicate usernames (keep the first one)
    const duplicateUsernames = await db.all(`
      SELECT username, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM users
      GROUP BY username
      HAVING count > 1
    `);
    
    // Find and remove duplicate emails (keep the first one)
    const duplicateEmails = await db.all(`
      SELECT email, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM users
      GROUP BY email
      HAVING count > 1
    `);
    
    let removedCount = 0;
    
    // Remove duplicate usernames
    for (const duplicate of duplicateUsernames) {
      const ids = duplicate.ids.split(',');
      const [keep, ...remove] = ids;
      for (const id of remove) {
        await db.run('DELETE FROM users WHERE id = ?', id);
        removedCount++;
      }
      console.log(`Removed ${remove.length} duplicate users with username: ${duplicate.username}`);
    }
    
    // Remove duplicate emails
    for (const duplicate of duplicateEmails) {
      const ids = duplicate.ids.split(',');
      const [keep, ...remove] = ids;
      for (const id of remove) {
        await db.run('DELETE FROM users WHERE id = ?', id);
        removedCount++;
      }
      console.log(`Removed ${remove.length} duplicate users with email: ${duplicate.email}`);
    }
    
    const result = await db.get('SELECT COUNT(*) as count FROM users');
    return { removed: removedCount, kept: result.count };
  }
}

async function cleanupDatabase() {
  console.log('🧹 Kurukshetra Database Cleanup Tool');
  console.log('=====================================\n');

  try {
    // Initialize database connection
    await setupDatabaseConnection();
    
    console.log('📊 Checking database integrity...');
    
    // Get current stats
    const statsBefore = await getDatabaseStats();
    console.log(`   Total users: ${statsBefore.totalUsers}`);
    console.log(`   Unique usernames: ${statsBefore.uniqueUsernames}`);
    console.log(`   Unique emails: ${statsBefore.uniqueEmails}\n`);
    
    // Check if cleanup is needed
    const usernameDuplicates = statsBefore.totalUsers - statsBefore.uniqueUsernames;
    const emailDuplicates = statsBefore.totalUsers - statsBefore.uniqueEmails;
    
    if (usernameDuplicates === 0 && emailDuplicates === 0) {
      console.log('✅ Database is clean! No duplicate users found.');
      return;
    }
    
    console.log('⚠️  Duplicate users detected:');
    if (usernameDuplicates > 0) {
      console.log(`   ${usernameDuplicates} duplicate usernames`);
    }
    if (emailDuplicates > 0) {
      console.log(`   ${emailDuplicates} duplicate emails`);
    }
    console.log();
    
    console.log('🔄 Removing duplicate users...');
    const cleanupResult = await removeDuplicateUsers();
    
    console.log('\n📊 Cleanup completed!');
    console.log(`   Duplicate users removed: ${cleanupResult.removed}`);
    console.log(`   Users remaining: ${cleanupResult.kept}`);
    
    // Verify cleanup
    const statsAfter = await getDatabaseStats();
    console.log('\n✅ Final verification:');
    console.log(`   Total users: ${statsAfter.totalUsers}`);
    console.log(`   Unique usernames: ${statsAfter.uniqueUsernames}`);
    console.log(`   Unique emails: ${statsAfter.uniqueEmails}`);
    
    if (statsAfter.totalUsers === statsAfter.uniqueUsernames && 
        statsAfter.totalUsers === statsAfter.uniqueEmails) {
      console.log('\n🎉 Database cleanup successful! No duplicates remaining.');
    } else {
      console.log('\n⚠️  Warning: Some duplicates may still exist. Manual review recommended.');
    }
    
  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run cleanup if script is executed directly
if (require.main === module) {
  cleanupDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { cleanupDatabase };
