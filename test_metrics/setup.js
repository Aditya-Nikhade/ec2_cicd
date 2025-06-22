import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../backend/.env') });

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.TEST_PORT || '5001';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/chat-test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key';

// Global test timeout
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Extend the default timeout for all tests
const originalSetTimeout = global.setTimeout;
global.setTimeout = (fn, delay = DEFAULT_TIMEOUT, ...args) => {
  return originalSetTimeout(fn, delay, ...args);
};

// Clean up function to be called after tests
let cleanupFunctions = [];

export const registerCleanup = (fn) => {
  cleanupFunctions.push(fn);};

// Handle process exit
const cleanup = async () => {
  try {
    await Promise.all(cleanupFunctions.map(fn => Promise.resolve(fn())));
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Global test utilities
global.TestUtils = {
  sleep: (ms) => new Promise(resolve => originalSetTimeout(resolve, ms)),
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  randomEmail: () => {
    return `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@test.com`;
  },
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = await condition();
      if (result) return result;
      await new Promise(r => originalSetTimeout(r, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Global test hooks
beforeAll(async () => {
  // Any setup that needs to happen before all tests
});

afterAll(async () => {
  // Any cleanup that needs to happen after all tests
});

afterEach(async () => {
  // Cleanup after each test
  jest.clearAllMocks();
});
