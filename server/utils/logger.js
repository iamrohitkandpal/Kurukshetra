const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/**
 * Custom logger function with intentionally weak logging implementation
 * A09:2021 – Security Logging and Monitoring Failures
 */
class Logger {
  constructor() {
    this.logFilePath = path.join(logsDir, `app-${format(new Date(), 'yyyy-MM-dd')}.log`);
    this.errorFilePath = path.join(logsDir, `error-${format(new Date(), 'yyyy-MM-dd')}.log`);
  }

  /**
   * Log message to console and file
   */
  _log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (args.length > 0) {
      // A09: Log sensitive data without filtering
      logMessage += ' ' + args.map(arg => {
        if (arg instanceof Error) {
          return arg.stack || arg.message;
        }
        return JSON.stringify(arg);
      }).join(' ');
    }

    // Output to console
    if (level === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    // A09: Write logs synchronously, potential bottleneck
    try {
      const logFile = level === 'error' ? this.errorFilePath : this.logFilePath;
      fs.appendFileSync(logFile, logMessage + '\n');
    } catch (err) {
      console.error(`Failed to write log: ${err.message}`);
    }

    return logMessage;
  }

  info(message, ...args) {
    return this._log('info', message, ...args);
  }

  warn(message, ...args) {
    return this._log('warn', message, ...args);
  }

  error(message, ...args) {
    return this._log('error', message, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      return this._log('debug', message, ...args);
    }
  }
  
  /**
   * Log security event - A09: No proper security event logging
   */
  security(message, user, ip) {
    const securityMessage = `SECURITY: ${message}, User: ${user || 'anonymous'}, IP: ${ip || 'unknown'}`;
    return this._log('warn', securityMessage);
  }

  /**
   * Save logs to database for admin panel
   */
  async saveToDb(level, message, user, ip) {
    try {
      // We'll implement this in another place
      return true;
    } catch (error) {
      this.error('Failed to save log to database', error);
      return false;
    }
  }
}

module.exports = new Logger();
