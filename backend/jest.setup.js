// Jest setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/greenweave_test';
process.env.API_URL = 'http://localhost:5001';

// Set up any global configuration for Jest tests here
jest.setTimeout(30000); // Increase timeout to 30 seconds for async tests

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 