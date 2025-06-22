const logger = require('./logger');

class WebhookCache {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000); // Cleanup every hour
  }

  add(id, request) {
    this.requests.set(id, {
      timestamp: Date.now(),
      request
    });
  }

  get(id) {
    const entry = this.requests.get(id);
    return entry ? entry.request : null;
  }

  cleanup() {
    const now = Date.now();
    const expiry = 3600000; // 1 hour in milliseconds

    for (const [id, entry] of this.requests.entries()) {
      if (now - entry.timestamp > expiry) {
        this.requests.delete(id);
        logger.debug(`Cleaned up webhook request: ${id}`);
      }
    }
  }

  clear() {
    this.requests.clear();
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

module.exports = new WebhookCache();
