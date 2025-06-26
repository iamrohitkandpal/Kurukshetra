const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { validateEnv } = require('./utils/envValidator');
const { initializeDatabase } = require('./config/dbManager');
const { errorHandler } = require('./middleware/errorHandler'); // Destructure errorHandler
const logger = require('./utils/logger');
const PORT = process.env.PORT || 5000;

// Load environment variables
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '.env.production')
    : path.join(__dirname, '.env.development')
});

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

// Ensure directories exist
['uploads', 'logs'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    console.log(`Created directory: ${dirPath}`);
  }
});

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://kurukshetra-app.vercel.app',
    'https://kurukshetra-app-git-main-iamrohitkandpal-4938s-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/files', require('./routes/files'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/db', require('./routes/db'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Validate errorHandler
if (typeof errorHandler !== 'function') {
  console.error('Error: errorHandler is not a valid middleware function');
  process.exit(1);
}

// Global error handler
app.use(errorHandler);

try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('✅ Server initialized — waiting for incoming requests');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  // Log but don't exit - let the process manager handle restarts
  logger.error('Server initialization failed:', error);
}

module.exports = app;