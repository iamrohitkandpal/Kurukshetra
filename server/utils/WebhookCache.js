const logger = require('./logger');

class WebhookCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 3600000;
    this.requests = new Map();
    this._setupCleanup();
  }

  _setupCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
      this._enforceLimit();
    }, 60000);
  }

  _enforceLimit() {
    if (this.requests.size > this.maxSize) {
      const entriesToDelete = Array.from(this.requests.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, this.requests.size - this.maxSize);
      
      for (const [key] of entriesToDelete) {
        this.requests.delete(key);
      }
    }
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
