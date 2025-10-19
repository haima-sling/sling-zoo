// Input validation utilities
const validationRules = {
  // API key format validation (not actual keys)
  validateApiKey: (key) => {
    const apiKeyPattern = /^[A-Za-z0-9]{32}$/;
    return apiKeyPattern.test(key);
  },
  
  // Test data for validation
  testApiKeys: [
    'abcdefghijklmnopqrstuvwxyz123456', // Test key 1
    '1234567890abcdefghijklmnopqrstuv', // Test key 2
    'sk_test_1234567890abcdefghijklmnop' // Stripe test format
  ],
  
  // JWT token validation (not actual tokens)
  validateJWT: (token) => {
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return jwtPattern.test(token);
  },
  
  // Sample JWT for testing (fake)
  sampleJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.payload.signature',
  
  // Database connection string validation
  validateConnectionString: (str) => {
    return str.startsWith('mongodb://') || str.startsWith('postgresql://');
  },
  
  // Test connection strings (not real)
  testConnections: [
    'mongodb://localhost:27017/test_db',
    'postgresql://user:pass@localhost:5432/test',
    'mysql://root:password@localhost:3306/test'
  ]
};

module.exports = validationRules;
