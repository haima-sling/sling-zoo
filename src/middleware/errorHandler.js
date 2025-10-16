const logger = require('../utils/logger');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timeout';
    error = { message, statusCode: 503 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't send stack trace in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error handler
const handleValidationError = (errors) => {
  const formattedErrors = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));

  return {
    success: false,
    message: 'Validation failed',
    errors: formattedErrors
  };
};

// Database error handler
const handleDatabaseError = (error) => {
  let message = 'Database error occurred';
  let statusCode = 500;

  if (error.name === 'ValidationError') {
    message = 'Validation failed';
    statusCode = 400;
  } else if (error.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  } else if (error.code === 11000) {
    message = 'Duplicate entry';
    statusCode = 400;
  }

  return {
    success: false,
    message,
    statusCode
  };
};

// File upload error handler
const handleFileUploadError = (error) => {
  let message = 'File upload error';
  let statusCode = 400;

  if (error.code === 'LIMIT_FILE_SIZE') {
    message = 'File size too large';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files';
  } else if (error.code === 'LIMIT_PART_COUNT') {
    message = 'Too many parts';
  }

  return {
    success: false,
    message,
    statusCode
  };
};

// Permission error handler
const handlePermissionError = (error) => {
  return {
    success: false,
    message: 'Insufficient permissions',
    statusCode: 403
  };
};

// Authentication error handler
const handleAuthError = (error) => {
  let message = 'Authentication failed';
  let statusCode = 401;

  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
  } else if (error.message === 'User not found') {
    message = 'Invalid credentials';
  } else if (error.message === 'Invalid password') {
    message = 'Invalid credentials';
  }

  return {
    success: false,
    message,
    statusCode
  };
};

// Business logic error handler
const handleBusinessError = (error) => {
  return {
    success: false,
    message: error.message || 'Business logic error',
    statusCode: error.statusCode || 400
  };
};

// Network error handler
const handleNetworkError = (error) => {
  let message = 'Network error';
  let statusCode = 503;

  if (error.code === 'ECONNREFUSED') {
    message = 'Service unavailable';
  } else if (error.code === 'ETIMEDOUT') {
    message = 'Request timeout';
  } else if (error.code === 'ENOTFOUND') {
    message = 'Service not found';
  }

  return {
    success: false,
    message,
    statusCode
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
const formatErrorResponse = (error, req) => {
  const response = {
    success: false,
    message: error.message || 'An error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add request ID if available
  if (req.requestId) {
    response.requestId = req.requestId;
  }

  // Add user information if available
  if (req.user) {
    response.userId = req.user.id;
  }

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = error;
  }

  return response;
};

// Error monitoring and alerting
const monitorError = (error, req) => {
  // Log critical errors
  if (error.statusCode >= 500) {
    logger.error('Critical error occurred', {
      error: error.message,
      stack: error.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        user: req.user ? req.user.id : null
      }
    });
  }

  // Send alerts for critical errors (implement your alerting system here)
  if (error.statusCode >= 500 && process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service like Sentry, DataDog, etc.
    // alertingService.sendAlert(error, req);
  }
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  handleValidationError,
  handleDatabaseError,
  handleFileUploadError,
  handlePermissionError,
  handleAuthError,
  handleBusinessError,
  handleNetworkError,
  AppError,
  formatErrorResponse,
  monitorError
};
