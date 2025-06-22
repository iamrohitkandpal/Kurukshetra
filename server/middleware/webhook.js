const crypto = require('crypto');
const WebhookCache = require('../utils/WebhookCache');
const logger = require('../utils/logger');
const { AppError, ErrorTypes } = require('./errorHandler');

// A02:2021 - Cryptographic Failures: Weak secret comparison
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = req.headers['x-webhook-secret'];

  if (!signature || !secret) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  // A02:2021 - Cryptographic Failures: Timing attack vulnerable
  if (signature === secret) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid webhook signature' });
  }
};

// A04:2021 - Insecure Design: Weak rate limiting
const rateLimiter = (req, res, next) => {
  // Intentionally simple and bypassable rate limiting
  const ip = req.ip;
  const now = Date.now();
  
  if (global.webhookRequests && global.webhookRequests[ip]) {
    const lastRequest = global.webhookRequests[ip];
    if (now - lastRequest < 1000) { // 1 second
      return res.status(429).json({ error: 'Too many requests' });
    }
  }

  global.webhookRequests = global.webhookRequests || {};
  global.webhookRequests[ip] = now;
  next();
};

const webhookMiddleware = async (req, res, next) => {
  try {
    const webhookId = req.headers['x-webhook-id'];
    
    if (!webhookId) {
      throw new AppError('Missing webhook ID', ErrorTypes.WEBHOOK_ERROR, 400);
    }

    // Store request in cache
    WebhookCache.add(webhookId, {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      timestamp: new Date()
    });

    logger.info(`Processed webhook request: ${webhookId}`, {
      webhookId,
      method: req.method,
      path: req.path
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyWebhookSignature,
  rateLimiter,
  webhookMiddleware
};