require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);
const serveIndex = require('serve-index'); // A05: Directory listing
const { initDatabase } = require('./config/db');
const { setupMongoDb } = require('./config/mongodb');
const { checkEnv } = require('./utils/helpers');
const helmet = require('helmet');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  require('./utils/demoData')();
}

// Initialize databases
initDatabase();
if (checkEnv('ENABLE_NOSQL_INJECTION')) {
  setupMongoDb();
}

// Middleware setup
// A05: CORS misconfiguration if enabled
if (checkEnv('ENABLE_CORS_MISCONFIG')) {
  app.use(cors({ origin: '*', credentials: true }));
} else {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:1000', credentials: true }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'insecure_cookie'));
app.use(morgan('dev'));

// A01: Broken Access Control - Intentionally missing CSRF protection
app.use(session({
  store: new SqliteStore({
    db: 'sessions.db',
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // A02: Cookies not secure
    httpOnly: false // A02: Cookies accessible via JS
  }
}));

// A05: Security Misconfiguration - Revealing tech stack info
if (checkEnv('ENABLE_SECURITY_MISCONFIG')) {
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express 4.18.2');
    res.setHeader('Server', 'Node.js ' + process.version);
    next();
  });
}

// A06: Vulnerable component - Intentionally vulnerable file upload
const uploadLimitMB = parseInt(process.env.MAX_FILE_SIZE || '50');
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: uploadLimitMB * 1024 * 1024 }, // Default 50MB limit
  abortOnLimit: false, // A04: Insecure Design - No upload limit enforcement
  debug: checkEnv('ENABLE_DEBUG_ENDPOINTS') // A09: Exposing debug info
}));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// A05: Directory listing vulnerability
if (checkEnv('ENABLE_DIRECTORY_LISTING')) {
  app.use('/uploads', express.static(uploadsDir), serveIndex(uploadsDir, { 'icons': true }));
}

// Log Injection vulnerability setup - A09
if (checkEnv('ENABLE_LOG_INJECTION')) {
  morgan.token('user-input', (req) => {
    // Intentionally vulnerable log function that doesn't sanitize user input
    return req.body && req.body.username ? req.body.username : 'anonymous';
  });
  
  app.use(morgan(':method :url :status - User: :user-input'));
}

// Health check endpoint - A05: Information disclosure
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version,
    nodejs: process.version,
    uptime: process.uptime()
  });
});

// Setup endpoint
app.get('/setup', (req, res) => {
  try {
    const setup = require('./utils/setup');
    setup.initializeDemoData();
    res.json({ message: 'Setup complete. Demo data initialized.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes - Core functionality
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/files', require('./routes/files'));
app.use('/api/config', require('./routes/config'));

// New API Routes - Additional vulnerabilities
app.use('/api/mfa', require('./routes/mfa'));
app.use('/api/nosql', require('./routes/nosql'));
app.use('/api/xxe', require('./routes/xxe'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/security-questions', require('./routes/securityQuestions'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/import', require('./routes/import'));

// A06: Add vulnerable dependencies
app.use(require('body-parser').raw({ type: '*/*' })); // Known vulnerable version

// A09: Security Logging and Monitoring Failures - No monitoring or request filtering
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

// A09: No error handling middleware (or very poor implementation)
if (checkEnv('ENABLE_DEBUG_ENDPOINTS')) {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      details: err
    });
  });
} else {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Server error' });
  });
}

// A05: Intentionally misconfigured security headers
app.use(helmet({
  contentSecurityPolicy: false,
  xssFilter: false
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'client/public/uploads')));

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'client/public/images')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Debug mode: ${process.env.NODE_ENV !== 'production' ? 'enabled' : 'disabled'}`);
});
