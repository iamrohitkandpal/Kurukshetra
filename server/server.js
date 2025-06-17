require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);
const serveIndex = require('serve-index');
const { initDatabase } = require('./config/db');
const { checkEnv } = require('./utils/helpers');
const helmet = require('helmet');
const fs = require('fs'); // Added missing fs import

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize databases
initDatabase();
if (checkEnv('ENABLE_NOSQL_INJECTION')) {
  setupMongoDb();
}

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
  app.use(cors({
    origin: process.env.CLIENT_URL || 'https://kurukshetra-ruby.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'insecure_cookie'));
app.use(morgan('dev'));
app.use(fileUpload()); // Added missing fileUpload middleware

// A01: Broken Access Control - Insecure session setup
app.use(session({
  store: new SqliteStore({
    db: 'sessions.db',
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: false
  }
}));

// Setup upload directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Health check endpoint - A05: Information disclosure
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
  // Create a public directory for static files
  const publicPath = path.join(__dirname, 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  // Serve static files from public directory
  app.use(express.static(publicPath));
  
  // Create uploads directory if it doesn't exist
  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsPath));
}

// A09: Insufficient error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: err.stack // A09: Exposing stack traces
  });
});  // Fixed missing closing parenthesis

// Database setup
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/opt/data/kurukshetra.db'
  : path.join(__dirname, 'kurukshetra.db');

let db;
(async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Intentionally vulnerable: No input validation or sanitization
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    );
  `);
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Debug mode: ${process.env.NODE_ENV !== 'production' ? 'enabled' : 'disabled'}`);
});
