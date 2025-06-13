const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const { logAction } = require('../utils/helpers');

let mongoClient = null;

/**
 * Setup MongoDB connection for NoSQL injection examples
 */
const setupMongoDb = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra';
    
    // Connect to MongoDB using mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Also create a native MongoDB connection for direct access
    mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();
    
    logAction('MongoDB connection established');
    
    // Define schemas
    setupSchemas();
    
    // Create initial MongoDB data
    await initializeMongoData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

/**
 * Setup mongoose schemas
 */
const setupSchemas = () => {
  // Users schema
  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    apiKey: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  
  // Product schema
  const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String }
  });
  
  // Security questions schema
  const SecurityQuestionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  // Setup models if they don't exist
  mongoose.models.User || mongoose.model('User', UserSchema);
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
  mongoose.models.SecurityQuestion || mongoose.model('SecurityQuestion', SecurityQuestionSchema);
};

/**
 * Initialize MongoDB with test data
 */
const initializeMongoData = async () => {
  try {
    const User = mongoose.model('User');
    const Product = mongoose.model('Product');
    const SecurityQuestion = mongoose.model('SecurityQuestion');
    
    // Check if we already have data
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    if (userCount === 0) {
      // Create admin user
      const admin = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@vulnerable.app',
        password: require('md5')(process.env.ADMIN_PASSWORD || 'admin123'),
        role: 'admin',
        apiKey: process.env.ADMIN_API_KEY || 'admin-api-key-1234567890'
      });
      await admin.save();
      
      // Create regular user
      const user = new User({
        username: process.env.USER_USERNAME || 'user',
        email: process.env.USER_EMAIL || 'user@vulnerable.app',
        password: require('md5')(process.env.USER_PASSWORD || 'password123'),
        role: 'user',
        apiKey: 'user-api-key-0987654321'
      });
      await user.save();
      
      // Create security questions
      const adminQuestion = new SecurityQuestion({
        userId: admin._id,
        question: "What was your first pet's name?",
        answer: "fluffy"
      });
      await adminQuestion.save();
      
      const userQuestion = new SecurityQuestion({
        userId: user._id,
        question: "What is your mother's maiden name?",
        answer: "smith"
      });
      await userQuestion.save();
      
      logAction('MongoDB users and security questions created');
    }
    
    if (productCount === 0) {
      // Create sample products
      const products = [
        {
          name: 'Laptop',
          description: 'High performance laptop',
          price: 999.99,
          category: 'electronics',
          stock: 10
        },
        {
          name: 'Smartphone',
          description: 'Latest smartphone model',
          price: 499.99,
          category: 'electronics',
          stock: 15
        },
        {
          name: 'Headphones',
          description: 'Noise cancelling',
          price: 99.99,
          category: 'accessories',
          stock: 20
        }
      ];
      
      await Product.insertMany(products);
      logAction('MongoDB products created');
    }
  } catch (error) {
    console.error('Error creating MongoDB data:', error);
  }
};

/**
 * Get MongoDB client for direct access (vulnerable to NoSQL injection)
 */
const getMongoClient = () => {
  return mongoClient;
};

module.exports = {
  setupMongoDb,
  getMongoClient
};
