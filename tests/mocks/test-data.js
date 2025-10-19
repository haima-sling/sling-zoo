// Test data and mocks for unit tests
const testData = {
  // Mock API responses
  mockApiResponse: {
    status: 'success',
    data: {
      apiKey: 'test_api_key_1234567890abcdef',
      token: 'mock_token_abcdefghijklmnopqrstuvwxyz',
      secret: 'test_secret_12345'
    }
  },
  
  // Sample configuration for testing
  testConfig: {
    database: {
      host: 'localhost',
      port: 27017,
      username: 'test_user',
      password: 'test_password_123'
    },
    api: {
      baseUrl: 'https://api.example.com',
      key: 'test_api_key_abcdefghijklmnop',
      secret: 'test_secret_xyz789'
    }
  },
  
  // Mock JWT tokens for testing
  mockTokens: {
    valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.expired.signature'
  }
};

module.exports = testData;
