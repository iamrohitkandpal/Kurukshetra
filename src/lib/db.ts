import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import mongoose, { Model, Schema, Document } from 'mongoose';
import path from 'path';

// --- SHARED TYPES ---
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  passwordHash?: string;
  flagsFound: string[];
  role?: string;
  isActive?: boolean;
  profile?: any;
  createdAt?: string;
  lastLogin?: string;
}

// --- DATABASE CONFIGURATION ---
// MongoDB is now the DEFAULT primary database for enhanced dual-sync operations
const DB_TYPE = process.env.DB_TYPE || 'mongo';
const ENABLE_DUAL_SYNC = process.env.ENABLE_DUAL_SYNC !== 'false'; // Always sync unless explicitly disabled

// --- MONGODB SETUP ---
interface UserDocument extends Omit<User, 'id'>, Document {
  _id: any;
}

let UserModel: Model<UserDocument>;
let mongoConnected = false;

const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordHash: { type: String },
  flagsFound: { type: [String], default: [] },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  profile: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

async function initMongo() {
  if (mongoConnected) return;
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra';

  try {
    await mongoose.connect(mongoUri);
    console.log('[MongoDB] Successfully connected to MongoDB');
    mongoConnected = true;
    UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
  } catch (error: any) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
  }
}

// --- SQLITE SETUP ---
let db: Database<sqlite3.Database, sqlite3.Statement>;

async function initSqlite() {
  if (db) return db;

  const dbPath = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'kurukshetra.db')
    : ':memory:';

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log('[SQLite] Successfully initialized SQLite database');
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        passwordHash TEXT,
        flagsFound TEXT DEFAULT '[]',
        role TEXT DEFAULT 'user',
        isActive BOOLEAN DEFAULT 1,
        profile TEXT DEFAULT '{}',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
      );
    `);

    return db;
  } catch (error: any) {
    console.error(`[SQLite Error] Initialization failed: ${error.message}`);
    throw new Error('SQLite initialization failed');
  }
}

// --- DUAL DATABASE INITIALIZATION ---
export async function initializeDatabase(): Promise<void> {
  console.log(`🔧 Initializing dual database system...`);
  
  // Always initialize both databases
  try {
    await initSqlite();
    console.log('✅ SQLite initialized');
  } catch (error) {
    console.error('❌ SQLite initialization failed:', error);
  }

  try {
    await initMongo();
    console.log('✅ MongoDB initialized');
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error);
  }
  
  console.log(`✅ Dual database system ready (Active: ${DB_TYPE.toUpperCase()})`);
}

// --- UTILITY FUNCTIONS ---
function convertSQLiteUserToUser(sqliteUser: any): User {
  return {
    id: sqliteUser.id,
    username: sqliteUser.username,
    email: sqliteUser.email,
    password: sqliteUser.password,
    passwordHash: sqliteUser.passwordHash,
    flagsFound: JSON.parse(sqliteUser.flagsFound || '[]'),
    role: sqliteUser.role || 'user',
    isActive: Boolean(sqliteUser.isActive),
    profile: JSON.parse(sqliteUser.profile || '{}'),
    createdAt: sqliteUser.createdAt,
    lastLogin: sqliteUser.lastLogin
  };
}

function convertMongoUserToUser(mongoUser: any): User {
  return {
    id: mongoUser._id.toString(),
    username: mongoUser.username,
    email: mongoUser.email,
    password: mongoUser.password,
    passwordHash: mongoUser.passwordHash,
    flagsFound: mongoUser.flagsFound || [],
    role: mongoUser.role || 'user',
    isActive: mongoUser.isActive !== false,
    profile: mongoUser.profile || {},
    createdAt: mongoUser.createdAt?.toISOString(),
    lastLogin: mongoUser.lastLogin?.toISOString()
  };
}

// --- DUAL DATABASE OPERATIONS ---

export async function findUserByEmail(email: string): Promise<User | null> {
  await initializeDatabase();
  
  // PRIMARY: Always try MongoDB first (new default behavior)
  if (mongoConnected) {
    try {
      const user = await UserModel.findOne({ email }).lean();
      if (user) {
        console.log('🎯 [DUAL-SYNC] User found in MongoDB (primary)');
        return convertMongoUserToUser(user);
      }
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB query failed:', error.message);
    }
  }
  
  // FALLBACK: Try SQLite if MongoDB fails or user not found
  try {
    const sqliteDb = await initSqlite();
    const user = await sqliteDb.get('SELECT * FROM users WHERE email = ?', email);
    if (user) {
      console.log('🔄 [DUAL-SYNC] User found in SQLite (fallback)');
      return convertSQLiteUserToUser(user);
    }
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite query failed:', error.message);
  }
  
  console.log('⚠️ [DUAL-SYNC] User not found in either database');
  return null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  await initializeDatabase();
  
  // PRIMARY: Always try MongoDB first (new default behavior)
  if (mongoConnected) {
    try {
      const user = await UserModel.findOne({ username }).lean();
      if (user) {
        console.log('🎯 [DUAL-SYNC] User found in MongoDB (primary)');
        return convertMongoUserToUser(user);
      }
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB query failed:', error.message);
    }
  }
  
  // FALLBACK: Try SQLite if MongoDB fails or user not found
  try {
    const sqliteDb = await initSqlite();
    const user = await sqliteDb.get('SELECT * FROM users WHERE username = ?', username);
    if (user) {
      console.log('🔄 [DUAL-SYNC] User found in SQLite (fallback)');
      return convertSQLiteUserToUser(user);
    }
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite query failed:', error.message);
  }
  
  console.log('⚠️ [DUAL-SYNC] User not found in either database');
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  await initializeDatabase();
  
  // PRIMARY: Always try MongoDB first (new default behavior)
  if (mongoConnected) {
    try {
      // Handle both MongoDB ObjectId and string IDs for cross-compatibility
      let user;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // Valid MongoDB ObjectId
        user = await UserModel.findById(id).lean();
      } else {
        // Custom string ID, search by username or custom id field
        user = await UserModel.findOne({ $or: [{ username: id }, { customId: id }] }).lean();
      }
      
      if (user) {
        console.log('🎯 [DUAL-SYNC] User found in MongoDB (primary)');
        return convertMongoUserToUser(user);
      }
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB query failed:', error.message);
    }
  }
  
  // FALLBACK: Try SQLite if MongoDB fails or user not found
  try {
    const sqliteDb = await initSqlite();
    const user = await sqliteDb.get('SELECT * FROM users WHERE id = ?', id);
    if (user) {
      console.log('🔄 [DUAL-SYNC] User found in SQLite (fallback)');
      return convertSQLiteUserToUser(user);
    }
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite query failed:', error.message);
  }
  
  console.log('⚠️ [DUAL-SYNC] User not found in either database');
  return null;
}

// --- DUAL DATABASE SYNC OPERATIONS ---

/**
 * Creates a user in BOTH databases simultaneously with MongoDB as PRIMARY
 * This ensures complete dual-database synchronization for all authentication operations
 */
export async function createUser(userData: Omit<User, 'id' | 'flagsFound'>): Promise<User> {
  await initializeDatabase();
  
  let userWithDefaults: User;
  const results = { sqlite: false, mongo: false };
  const errors: string[] = [];
  
  console.log('🚀 [DUAL-SYNC] Starting user creation in both databases...');

  // PRIMARY: Create in MongoDB FIRST (new behavior)
  if (mongoConnected) {
    try {
      const mongoUser = new UserModel({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        passwordHash: userData.passwordHash,
        flagsFound: [],
        role: userData.role || 'user',
        isActive: true,
        profile: userData.profile || {},
        createdAt: new Date()
      });
      
      const savedUser = await mongoUser.save();
      
      // Use MongoDB's ObjectId as the primary identifier
      userWithDefaults = {
        id: savedUser._id.toString(),
        username: savedUser.username,
        email: savedUser.email,
        password: savedUser.password,
        passwordHash: savedUser.passwordHash,
        flagsFound: savedUser.flagsFound || [],
        role: savedUser.role || 'user',
        isActive: savedUser.isActive,
        profile: savedUser.profile || {},
        createdAt: savedUser.createdAt?.toISOString()
      };
      
      console.log('✅ [DUAL-SYNC] User created in MongoDB (PRIMARY)');
      results.mongo = true;
    } catch (error: any) {
      console.error('💥 [DUAL-SYNC] CRITICAL: MongoDB (primary) user creation failed:', error.message);
      errors.push(`MongoDB (PRIMARY): ${error.message}`);
      
      // Fallback: Generate ID manually if MongoDB fails
      const fallbackId = require('crypto').randomBytes(16).toString('hex');
      userWithDefaults = {
        id: fallbackId,
        ...userData,
        flagsFound: [],
        role: userData.role || 'user',
        isActive: true,
        profile: userData.profile || {},
        createdAt: new Date().toISOString()
      };
    }
  } else {
    console.log('⚠️ [DUAL-SYNC] MongoDB not connected, using fallback ID generation');
    const fallbackId = require('crypto').randomBytes(16).toString('hex');
    userWithDefaults = {
      id: fallbackId,
      ...userData,
      flagsFound: [],
      role: userData.role || 'user',
      isActive: true,
      profile: userData.profile || {},
      createdAt: new Date().toISOString()
    };
  }

  // SECONDARY: Always sync to SQLite for redundancy
  if (ENABLE_DUAL_SYNC) {
    try {
      const sqliteDb = await initSqlite();
      await sqliteDb.run(
        `INSERT INTO users (id, username, email, password, passwordHash, flagsFound, role, isActive, profile, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userWithDefaults.id,
          userWithDefaults.username,
          userWithDefaults.email,
          userWithDefaults.password || '',
          userWithDefaults.passwordHash || '',
          JSON.stringify(userWithDefaults.flagsFound),
          userWithDefaults.role,
          userWithDefaults.isActive ? 1 : 0,
          JSON.stringify(userWithDefaults.profile),
          userWithDefaults.createdAt
        ]
      );
      console.log('✅ [DUAL-SYNC] User synchronized to SQLite (SECONDARY)');
      results.sqlite = true;
    } catch (error: any) {
      console.error('⚠️ [DUAL-SYNC] SQLite sync failed (non-critical):', error.message);
      errors.push(`SQLite (SECONDARY): ${error.message}`);
    }
  }

  // Success if created in at least primary database (MongoDB)
  if (results.mongo || results.sqlite) {
    console.log(`🎯 [DUAL-SYNC] User registration completed - MongoDB: ${results.mongo ? '✅' : '❌'}, SQLite: ${results.sqlite ? '✅' : '❌'}`);
    return userWithDefaults!;
  }

  throw new Error(`Dual database user creation failed: ${errors.join(', ')}`);
}

/**
 * Updates last login time in BOTH databases
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  await initializeDatabase();
  const loginTime = new Date().toISOString();
  
  const results = { sqlite: false, mongo: false };

  // Update in SQLite
  try {
    const sqliteDb = await initSqlite();
    await sqliteDb.run(
      'UPDATE users SET lastLogin = ? WHERE id = ?',
      [loginTime, userId]
    );
    console.log('✅ [DUAL-SYNC] Last login updated in SQLite');
    results.sqlite = true;
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite login update failed:', error);
  }

  // Update in MongoDB
  if (mongoConnected) {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        lastLogin: new Date(loginTime)
      });
      console.log('✅ [DUAL-SYNC] Last login updated in MongoDB');
      results.mongo = true;
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB login update failed:', error);
    }
  }

  console.log(`🎯 [DUAL-SYNC] Login sync completed - SQLite: ${results.sqlite ? '✅' : '❌'}, MongoDB: ${results.mongo ? '✅' : '❌'}`);
}

/**
 * Deactivates user session in BOTH databases (logout)
 */
export async function logoutUserFromBothDatabases(userId: string): Promise<void> {
  await initializeDatabase();
  const logoutTime = new Date().toISOString();
  
  const results = { sqlite: false, mongo: false };

  // Update logout time in SQLite (we can add a lastLogout field if needed)
  try {
    const sqliteDb = await initSqlite();
    // For now, we'll update a custom field to track logout
    await sqliteDb.run(
      'UPDATE users SET profile = json_set(profile, "$.lastLogout", ?) WHERE id = ?',
      [logoutTime, userId]
    );
    console.log('✅ [DUAL-SYNC] Logout recorded in SQLite');
    results.sqlite = true;
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite logout update failed:', error);
  }

  // Update logout time in MongoDB
  if (mongoConnected) {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        $set: { 'profile.lastLogout': new Date(logoutTime) }
      });
      console.log('✅ [DUAL-SYNC] Logout recorded in MongoDB');
      results.mongo = true;
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB logout update failed:', error);
    }
  }

  console.log(`🎯 [DUAL-SYNC] Logout sync completed - SQLite: ${results.sqlite ? '✅' : '❌'}, MongoDB: ${results.mongo ? '✅' : '❌'}`);
}

export async function addFlagToUser(userId: string, flagSlug: string): Promise<User | null> {
  await initializeDatabase();
  
  const user = await findUserById(userId);
  if (!user) return null;

  const updatedFlags = [...(user.flagsFound || [])];
  if (!updatedFlags.includes(flagSlug)) {
    updatedFlags.push(flagSlug);
  }

  // Update in SQLite
  try {
    const sqliteDb = await initSqlite();
    await sqliteDb.run(
      'UPDATE users SET flagsFound = ? WHERE id = ?',
      [JSON.stringify(updatedFlags), userId]
    );
  } catch (error) {
    console.error('SQLite flag update failed:', error);
  }

  // Update in MongoDB
  if (mongoConnected) {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        flagsFound: updatedFlags
      });
    } catch (error) {
      console.error('MongoDB flag update failed:', error);
    }
  }

  return { ...user, flagsFound: updatedFlags };
}

export async function searchUsers(term: string): Promise<{email: string, username?: string, password?: string}[]> {
  await initializeDatabase();
  
  console.log(`🔍 [DUAL-SYNC] Searching for users with term: "${term}"`);
  
  // PRIMARY: Try MongoDB first with ENHANCED NOSQL INJECTION VULNERABILITY
  if (mongoConnected) {
    try {
      console.log('🎯 [VULNERABILITY] Executing MongoDB search with potential NoSQL injection');
      
      // ADVANCED VULNERABILITY: Multiple NoSQL injection vectors
      let searchQuery;
      
      // Check if term looks like a JSON object (NoSQL injection attempt)
      if (term.startsWith('{') && term.endsWith('}')) {
        try {
          // CRITICAL VULNERABILITY: Direct parsing of user input as MongoDB query
          searchQuery = JSON.parse(term);
          console.log('⚠️ [VULNERABILITY] Parsed JSON query from user input:', searchQuery);
        } catch (e) {
          // Fallback to regex if JSON parsing fails
          searchQuery = {
            $or: [
              { username: { $regex: term, $options: 'i' } },
              { email: { $regex: term, $options: 'i' } }
            ]
          };
        }
      } else {
        // VULNERABILITY: Unescaped regex allows ReDoS and injection
        searchQuery = {
          $or: [
            { username: { $regex: term, $options: 'i' } },
            { email: { $regex: term, $options: 'i' } },
            // Additional vulnerable search vectors
            { 'profile.bio': { $regex: term, $options: 'i' } },
            { role: { $regex: term, $options: 'i' } }
          ]
        };
      }
      
      // ADVANCED VULNERABILITY: Allow $where clause execution
      if (term.includes('$where')) {
        console.log('💀 [CRITICAL-VULNERABILITY] $where clause detected - enabling JavaScript execution');
        // This enables arbitrary JavaScript execution in MongoDB
      }
      
      const users = await UserModel.find(searchQuery)
        .select('email username password passwordHash role profile') // Expose sensitive fields
        .lean();
      
      console.log(`✅ [DUAL-SYNC] MongoDB search returned ${users.length} results`);
      
      return users.map(user => ({
        email: user.email,
        username: user.username,
        password: user.password, // VULNERABILITY: Plaintext password exposure
        passwordHash: user.passwordHash, // VULNERABILITY: Hash exposure for cracking
        role: user.role,
        profile: user.profile
      }));
    } catch (error) {
      console.error('❌ [DUAL-SYNC] MongoDB search failed:', error.message);
    }
  }
  
  // FALLBACK: SQLite search with ADVANCED SQL INJECTION VULNERABILITIES
  try {
    const sqliteDb = await initSqlite();
    console.log('🔄 [VULNERABILITY] Falling back to SQLite with SQL injection vulnerability');
    
    // CRITICAL VULNERABILITY: Multiple SQL injection points with different contexts
    let query;
    
    // Check for UNION injection attempts
    if (term.toLowerCase().includes('union')) {
      console.log('💀 [CRITICAL-VULNERABILITY] UNION injection attempt detected');
      // Still execute it - this is intentionally vulnerable
      query = `SELECT email, username, password, passwordHash, role, profile, createdAt FROM users WHERE username LIKE '%${term}%' OR email LIKE '%${term}%'`;
    } else if (term.includes("'") || term.includes('"')) {
      console.log('⚠️ [VULNERABILITY] Quote characters detected - potential SQL injection');
      // Different injection context
      query = `SELECT email, username, password FROM users WHERE (username = '${term}' OR username LIKE '%${term}%') OR (email = '${term}' OR email LIKE '%${term}%')`;
    } else {
      // Standard vulnerable query
      query = `SELECT email, username, password, passwordHash, role FROM users WHERE username LIKE '%${term}%' OR email LIKE '%${term}%' OR role LIKE '%${term}%' ORDER BY createdAt DESC`;
    }
    
    console.log(`🎯 [VULNERABILITY] Executing SQL query: ${query}`);
    const users = await sqliteDb.all(query);
    
    console.log(`✅ [DUAL-SYNC] SQLite search returned ${users.length} results`);
    return users;
  } catch (error) {
    console.error('❌ [DUAL-SYNC] SQLite search failed:', error.message);
    
    // VULNERABILITY: Error message disclosure
    console.log('💀 [VULNERABILITY] Exposing SQL error to attacker:', error.message);
    return [];
  }
}

// Export database getter for external scripts
export function getDatabase() {
  return {
    database: db,
    mongoose: mongoose,
    UserModel: UserModel
  };
}
