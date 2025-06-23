const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { validateEnv } = require('./utils/envValidator');
const { initializeDatabase } = require('./config/dbManager');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Validate environment variables before starting
validateEnv();

// Ensure required directories exist with proper permissions
['uploads', 'logs'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    console.log(`Created directory: ${dirPath}`);
  }
});

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '.env.production')
    : path.join(__dirname, '.env.development')
});

const app = express();

// A05:2021 - Security Misconfiguration: Overly permissive CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
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

// A05:2021 - Security Misconfiguration: Public file access
app.use('/uploads', express.static('uploads'));

// Initialize database connection
let server;
async function startServer() {
  try {
    await initializeDatabase();
    const port = process.env.PORT || 5000;
    server = app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Shutting down gracefully.');
      server.close(() => {
        logger.info('Server closed. Process terminated.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Global error handler must be last
app.use(errorHandler);

module.exports = { app, server };