require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { initializeDb } = require('./utils/ensureDb');
const logger = require('./utils/logger');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(bodyParser.raw({ type: '*/*' })); // Intentionally insecure (A06)

// Create uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  app.use(express.static(publicPath));
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Kurukshetra API - An intentionally vulnerable web application',
    warning: 'This application contains security vulnerabilities for educational purposes only'
  });
});

// Initialize DB and Routes
initializeDb()
  .then(() => {
    logger.info(`Database ${process.env.DB_TYPE || 'sqlite'} initialized successfully`);

    // API Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/files', require('./routes/files'));
    app.use('/api/feedback', require('./routes/feedback'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/db', require('./routes/dbSwitch'));
    app.use('/api/progress', require('./routes/progress'));
    app.use('/api/webhooks', require('./routes/webhooks'));
    app.use('/api/mfa', require('./routes/mfa'));
    app.use('/api/updates', require('./routes/updates'));
    app.use('/api/xxe', require('./routes/xxe'));
    app.use('/api/payments', require('./routes/payments'));
    app.use('/api/config', require('./routes/config'));
    app.use('/api/nosql', require('./routes/nosql'));
    app.use('/api/backup', require('./routes/backup'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.warn('This application contains intentional security vulnerabilities for training purposes');
    });
  })
  .catch((err) => {
    logger.error('Failed to initialize database:', err);
    process.exit(1); // Fail loudly if DB init fails
  });

// Global error handler (A09 - exposes stack)
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;
