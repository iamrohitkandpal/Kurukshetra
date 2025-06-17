require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);
const serveIndex = require('serve-index');
const helmet = require('helmet');
const fs = require('fs');
const db = require('./config/db');

// Helpers and database setup
const { initDatabase } = require('./config/db');
const { checkEnv } = require('./utils/helpers');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database
initDatabase();

// Initialize demo data
const { createDemoData } = require('./utils/demoData');
createDemoData()
  .then(() => console.log('Demo data initialized'))
  .catch(err => console.error('Error initializing demo data:', err));

// A05: Intentionally misconfigured security headers
app.use(helmet({
  contentSecurityPolicy: false,
  xssFilter: false
}));

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
app.use(fileUpload());

// A01: Broken Access Control - Insecure session setup
app.use(session({
  store: new SqliteStore({ db: 'sessions.db', concurrentDB: true }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false }
}));

// Upload directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir), serveIndex(uploadsDir, { icons: true }));

// A05: Directory listing vulnerability
app.use('/uploads', express.static(uploadsDir), serveIndex(uploadsDir, { 'icons': true }));

// Log Injection vulnerability setup - A09
if (checkEnv('ENABLE_LOG_INJECTION')) {
  morgan.token('user-input', (req) => {
    // Intentionally vulnerable log function that doesn't sanitize user input
    return req.body && req.body.username ? req.body.username : 'anonymous';
  });
  app.use(morgan(':method :url :status - User: :user-input'));
}

// Health check - A05: Info disclosure
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    version: require(path.join(__dirname, 'package.json')).version,
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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/files', require('./routes/files'));
app.use('/api/config', require('./routes/config'));

// Optional: These routes can be mocked or disabled as needed
app.use('/api/mfa', require('./routes/mfa'));
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
  const publicPath = path.join(__dirname, 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  app.use(express.static(publicPath));
  app.use('/uploads', express.static(uploadsDir));
}

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// A09: Insufficient error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Debug mode: ${process.env.NODE_ENV !== 'production' ? 'enabled' : 'disabled'}`);
  console.log(`Database status: ${db ? 'Connected' : 'Disconnected'}`);
});
