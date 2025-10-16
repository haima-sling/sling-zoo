const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const validationRules = {
  // Email validation
  email: () => body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  // Password validation
  password: () => body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name validation
  firstName: () => body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: () => body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  // Phone validation
  phone: () => body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),

  // MongoDB ObjectId validation
  mongoId: (fieldName = 'id') => param(fieldName)
    .isMongoId()
    .withMessage(`Invalid ${fieldName} format`),

  // Date validation
  date: (fieldName) => body(fieldName)
    .isISO8601()
    .toDate()
    .withMessage(`${fieldName} must be a valid date`),

  // Number validation
  number: (fieldName, min = 0, max = Infinity) => body(fieldName)
    .isFloat({ min, max })
    .withMessage(`${fieldName} must be a number between ${min} and ${max}`),

  // Boolean validation
  boolean: (fieldName) => body(fieldName)
    .isBoolean()
    .withMessage(`${fieldName} must be a boolean value`),

  // String validation
  string: (fieldName, minLength = 1, maxLength = 255) => body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`),

  // Enum validation
  enum: (fieldName, allowedValues) => body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`),

  // Array validation
  array: (fieldName, minLength = 0, maxLength = Infinity) => body(fieldName)
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be an array with ${minLength} to ${maxLength} items`),

  // URL validation
  url: (fieldName) => body(fieldName)
    .optional()
    .isURL()
    .withMessage(`${fieldName} must be a valid URL`),

  // Positive number validation
  positiveNumber: (fieldName) => body(fieldName)
    .isFloat({ min: 0.01 })
    .withMessage(`${fieldName} must be a positive number`),

  // Integer validation
  integer: (fieldName, min = 0, max = Infinity) => body(fieldName)
    .isInt({ min, max })
    .withMessage(`${fieldName} must be an integer between ${min} and ${max}`)
};

// Validation middleware generators
const validators = {
  // User registration validation
  register: [
    validationRules.firstName(),
    validationRules.lastName(),
    validationRules.email(),
    validationRules.password(),
    validationRules.phone()
  ],

  // User login validation
  login: [
    validationRules.email(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Animal creation validation
  createAnimal: [
    validationRules.string('name', 1, 100),
    validationRules.string('species', 1, 100),
    validationRules.enum('gender', ['male', 'female', 'unknown']),
    validationRules.date('birthDate'),
    validationRules.date('arrivalDate'),
    validationRules.enum('origin', ['wild', 'captive_bred', 'rescue', 'transfer', 'donation']),
    body('exhibitId').isMongoId().withMessage('Invalid exhibit ID'),
    body('diet.primary').notEmpty().withMessage('Primary diet is required'),
    body('diet.feedingFrequency').notEmpty().withMessage('Feeding frequency is required')
  ],

  // Visitor creation validation
  createVisitor: [
    validationRules.firstName(),
    validationRules.lastName(),
    validationRules.email(),
    validationRules.phone(),
    body('dateOfBirth').optional().isISO8601().toDate().withMessage('Date of birth must be a valid date'),
    validationRules.enum('gender', ['male', 'female', 'other', 'prefer_not_to_say']).optional()
  ],

  // Ticket creation validation
  createTicket: [
    body('visitorId').isMongoId().withMessage('Invalid visitor ID'),
    validationRules.enum('type', ['adult', 'child', 'senior', 'student', 'group', 'annual_pass', 'vip']),
    validationRules.positiveNumber('price'),
    validationRules.date('visitDate'),
    validationRules.enum('paymentMethod', ['cash', 'credit_card', 'debit_card', 'online', 'voucher', 'complimentary'])
  ],

  // Exhibit creation validation
  createExhibit: [
    validationRules.string('name', 1, 100),
    validationRules.enum('type', ['indoor', 'outdoor', 'aquatic', 'aviary', 'nocturnal', 'interactive', 'educational']),
    validationRules.enum('theme', ['african_savanna', 'tropical_rainforest', 'arctic_tundra', 'desert', 'ocean', 'forest', 'grassland', 'wetland', 'mountain', 'urban']),
    validationRules.string('description', 1, 1000),
    validationRules.integer('capacity.visitors', 1),
    validationRules.integer('capacity.animals', 1)
  ],

  // Staff creation validation
  createStaff: [
    validationRules.string('employeeId', 3, 20),
    validationRules.firstName(),
    validationRules.lastName(),
    validationRules.email(),
    validationRules.phone(),
    validationRules.enum('role', ['admin', 'veterinarian', 'animal_care', 'maintenance', 'visitor_services', 'manager', 'security', 'education', 'conservation', 'research']),
    validationRules.string('department', 1, 100),
    validationRules.string('position', 1, 100),
    validationRules.positiveNumber('salary')
  ],

  // Feeding schedule validation
  createFeeding: [
    body('animalId').isMongoId().withMessage('Invalid animal ID'),
    validationRules.string('foodType', 1, 100),
    validationRules.string('quantity', 1, 50),
    body('scheduledTime')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Scheduled time must be in HH:MM format')
  ],

  // Health record validation
  createHealthRecord: [
    body('animalId').isMongoId().withMessage('Invalid animal ID'),
    validationRules.date('date'),
    validationRules.string('veterinarian', 1, 100),
    validationRules.enum('type', ['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'follow_up']).optional(),
    validationRules.string('diagnosis', 1, 500),
    validationRules.string('treatment', 1, 500),
    validationRules.number('cost', 0)
  ],

  // Report generation validation
  generateReport: [
    validationRules.enum('type', ['health', 'visitor', 'financial', 'exhibit', 'staff', 'operational', 'custom']),
    validationRules.date('startDate'),
    validationRules.date('endDate'),
    body('endDate').custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
  ],

  // Pagination validation
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  // Search validation
  search: [
    query('q').notEmpty().withMessage('Search query is required').trim().isLength({ min: 1, max: 100 })
  ]
};

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Custom validators
const customValidators = {
  // Check if date is in the past
  isPastDate: (fieldName) => body(fieldName)
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error(`${fieldName} must be in the past`);
      }
      return true;
    }),

  // Check if date is in the future
  isFutureDate: (fieldName) => body(fieldName)
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error(`${fieldName} must be in the future`);
      }
      return true;
    }),

  // Check if value is unique (requires model and field)
  isUnique: (model, field) => body(field)
    .custom(async (value) => {
      const exists = await model.findOne({ [field]: value });
      if (exists) {
        throw new Error(`${field} already exists`);
      }
      return true;
    }),

  // Check if referenced document exists
  documentExists: (model, fieldName) => body(fieldName)
    .custom(async (value) => {
      const exists = await model.findById(value);
      if (!exists) {
        throw new Error(`Referenced ${model.modelName} does not exist`);
      }
      return true;
    })
};

module.exports = {
  validationRules,
  validators,
  handleValidationErrors,
  customValidators
};
