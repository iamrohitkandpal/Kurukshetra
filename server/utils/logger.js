const winston = require('winston');
const path = require('path');
let DailyRotateFile;

// Safely import daily rotate file
try {
  DailyRotateFile = require('winston-daily-rotate-file');
} catch (err) {
  console.warn('winston-daily-rotate-file not available, falling back to regular file transport');
}

const { format } = winston;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Create base transports array
const transports = [];

// Add rotating file transport if available
if (DailyRotateFile) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(__dirname, '../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  );
} else {
  // Fallback to regular file transport
  transports.push(
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log')
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: transports
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}

const addRequestContext = format((info, opts) => {
  if (opts.req) {
    info.requestId = opts.req.id;
    info.method = opts.req.method;
    info.path = opts.req.path;
  }
  return info;
});

logger.addRequestContext = addRequestContext;

module.exports = logger;