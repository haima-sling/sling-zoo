const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.logError(error, req);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or has admin privileges
const authorizeOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin users can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user.id.toString()) {
      logger.logSecurity('Unauthorized resource access attempt', {
        userId: req.user.id,
        resourceUserId,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only access your own resources'
      });
    }

    next();
  };
};

// Middleware to check API key for external services
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  // In a real application, you would validate the API key against a database
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.logSecurity('Invalid API key attempt', {
      apiKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method
    });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
};

// Middleware to check if user has specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin users have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      logger.logSecurity('Permission denied', {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        endpoint: req.originalUrl,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Middleware to log authentication events
const logAuthEvent = (eventType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful authentication
      if (res.statusCode < 400 && req.user) {
        logger.logAuth(eventType, req.user.id, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to check if user account is verified
const requireVerifiedAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required'
    });
  }

  next();
};

// Middleware to check if user has completed profile setup
const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  const missingFields = requiredFields.filter(field => !req.user[field]);

  if (missingFields.length > 0) {
    return res.status(403).json({
      success: false,
      message: 'Complete profile setup required',
      missingFields
    });
  }

  next();
};

// Middleware to check session timeout
const checkSessionTimeout = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  const tokenIssuedAt = req.user.iat * 1000; // Convert to milliseconds
  
  if (Date.now() - tokenIssuedAt > sessionTimeout) {
    return res.status(401).json({
      success: false,
      message: 'Session expired'
    });
  }

  next();
};

// Export all middleware functions
module.exports = {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin,
  authenticateApiKey,
  checkPermission,
  logAuthEvent,
  requireVerifiedAccount,
  requireCompleteProfile,
  checkSessionTimeout
};

// Default export for backward compatibility
module.exports = authenticateToken;
