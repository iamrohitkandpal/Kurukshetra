const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

const { format } = winston;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`;
  })
);

const rotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log')
    }),
    rotateTransport
  ]
});

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