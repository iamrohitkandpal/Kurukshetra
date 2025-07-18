const path = require('path');

const config = {
  db: {
    sqlite: {
      dialect: 'sqlite',
      storage: path.join(__dirname, '../data/kurukshetra.sqlite'),
      logging: console.log // Should use logger utility instead
    },
    mongodb: {
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/kurukshetra',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Missing connection timeout settings
        // Missing retry settings
      }
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'kurukshetra-secret-key',
    tokenExpiry: '24h' // intentionally long expiry
  },
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      credentials: true
    }
  },
  upload: {
    path: path.join(__dirname, '../../uploads'),
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: path.join(__dirname, '../../logs/app.log')
  }
};

// Add validation
if (!process.env.NODE_ENV) {
  console.warn('NODE_ENV not set, defaulting to development');
}

module.exports = config;