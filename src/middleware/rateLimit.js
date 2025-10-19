const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client for rate limiting
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.connect().catch(err => {
      logger.error('Redis connection error for rate limiting:', err);
    });
  }
} catch (error) {
  logger.warn('Redis not available for rate limiting, using memory store');
}

// Default rate limit configuration
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  skip: (req) => {
    // Skip rate limiting for whitelisted IPs
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }) : undefined
});

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }) : undefined
});

// API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: 'API rate limit exceeded, please slow down.'
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }) : undefined
});

// Upload rate limit
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 file uploads per hour
  message: {
    success: false,
    message: 'Upload rate limit exceeded, please try again later.'
  },
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded:', {
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please try again in an hour.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }) : undefined
});

// Create custom rate limiter
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: options.handler || ((req, res) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        limit: options.max
      });
      
      res.status(429).json({
        success: false,
        message: options.message?.message || 'Rate limit exceeded',
        retryAfter: req.rateLimit.resetTime
      });
    }),
    skip: options.skip,
    store: redisClient && options.useRedis !== false ? new RedisStore({
      client: redisClient,
      prefix: options.prefix || 'rl:custom:'
    }) : undefined
  });
};

// Rate limit by user ID
const createUserRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    keyGenerator: (req) => {
      // Use user ID instead of IP for authenticated requests
      return req.user ? req.user.id : req.ip;
    },
    message: options.message || {
      success: false,
      message: 'User rate limit exceeded'
    },
    store: redisClient ? new RedisStore({
      client: redisClient,
      prefix: 'rl:user:'
    }) : undefined
  });
};

// Export rate limiters
module.exports = {
  defaultLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  createRateLimiter,
  createUserRateLimiter
};
