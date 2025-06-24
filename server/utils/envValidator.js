const logger = require('./logger');

const requiredEnvVars = {
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  DB_TYPE: process.env.DB_TYPE || 'sqlite',
  MONGODB_URI: process.env.DB_TYPE === 'mongodb' ? process.env.MONGODB_URI : true,
};

function validateEnv() {
  const missingVars = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  // Validate specific values
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be development, production, or test');
  }

  if (!['mongodb', 'sqlite'].includes(process.env.DB_TYPE)) {
    throw new Error('DB_TYPE must be mongodb or sqlite');
  }

  logger.info('Environment validation successful');
  return true;
}

// Add to envValidator.js
const validateValue = (key, value) => {
  const validators = {
    NODE_ENV: (val) => ['development', 'production', 'test'].includes(val),
    DB_TYPE: (val) => ['mongodb', 'sqlite'].includes(val),
    JWT_SECRET: (val) => typeof val === 'string' && val.length >= 32,
    MONGODB_URI: (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://')
  };

  return validators[key] ? validators[key](value) : true;
};

function validateEnvValues() {
  const invalidVars = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (!validateValue(key, value)) {
      invalidVars.push(key);
    }
  }
  return invalidVars;
}

module.exports = { validateEnv, validateEnvValues };
