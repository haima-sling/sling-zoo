const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware wrapper
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
      field: err.param, 
      message: err.msg,
      value: err.value 
    }));

    logger.warn('Validation failed:', { 
      path: req.path,
      method: req.method,
      errors: extractedErrors 
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  };
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Check required fields middleware
const requireFields = (...fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    next();
  };
};

// Validate ObjectId middleware
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

// Validate date range middleware
const validateDateRange = (startField = 'startDate', endField = 'endDate') => {
  return (req, res, next) => {
    const startDate = req.body[startField] || req.query[startField];
    const endDate = req.body[endField] || req.query[endField];

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: `Both ${startField} and ${endField} are required`
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: `${startField} must be before ${endField}`
      });
    }

    next();
  };
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }

  req.pagination = { page, limit };
  next();
};

// Validate file upload
const validateFileUpload = (allowedTypes, maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files || [req.file];

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
        });
      }
    }

    next();
  };
};

// Validate enum value
const validateEnum = (field, allowedValues, source = 'body') => {
  return (req, res, next) => {
    const value = req[source][field];

    if (value && !allowedValues.includes(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${field}. Allowed values: ${allowedValues.join(', ')}`
      });
    }

    next();
  };
};

// Validate array length
const validateArrayLength = (field, minLength = 0, maxLength = Infinity) => {
  return (req, res, next) => {
    const array = req.body[field];

    if (!Array.isArray(array)) {
      return res.status(400).json({
        success: false,
        message: `${field} must be an array`
      });
    }

    if (array.length < minLength || array.length > maxLength) {
      return res.status(400).json({
        success: false,
        message: `${field} must have between ${minLength} and ${maxLength} items`
      });
    }

    next();
  };
};

// Custom validation middleware
const customValidation = (validationFn, errorMessage) => {
  return async (req, res, next) => {
    try {
      const isValid = await validationFn(req);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: errorMessage || 'Validation failed'
        });
      }

      next();
    } catch (error) {
      logger.error('Custom validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

module.exports = {
  validate,
  sanitizeInput,
  requireFields,
  validateObjectId,
  validateDateRange,
  validatePagination,
  validateFileUpload,
  validateEnum,
  validateArrayLength,
  customValidation
};
