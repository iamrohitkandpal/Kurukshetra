const logger = require('../utils/logger');

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTH_ERROR: 'AuthenticationError',
  NOT_FOUND: 'NotFoundError',
  FORBIDDEN: 'ForbiddenError',
  DATABASE_ERROR: 'DatabaseError',
  WEBHOOK_ERROR: 'WebhookError'
};

class AppError extends Error {
  constructor(message, type, statusCode) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
  }
}

const createErrorResponse = (error, includeStack = false) => ({
  error: {
    message: error.message,
    type: error.type || 'UnknownError',
    code: error.code,
    ...(includeStack && process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  }
});

const errorHandler = (err, req, res, next) => {
  // Log error with stack trace for debugging
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Don't leak stack traces to client
  const error = {
    message: err.message || 'Internal Server Error',
    code: err.code || 'UNKNOWN_ERROR'
  };

  // Keep status code if set, default to 500
  const statusCode = err.statusCode || 500;

  // Send sanitized error to client
  res.status(statusCode).json({ error });
};

module.exports = {
  errorHandler,
  AppError,
  ErrorTypes
};