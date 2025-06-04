const { createClient } = require('redis');
const logger = require('./logger');

class CacheService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });
  }

  async connect() {
    await this.client.connect();
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache Get Error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      await this.client.set(key, stringValue, {
        EX: ttl,
      });
      return true;
    } catch (error) {
      logger.error('Cache Set Error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache Delete Error:', error);
      return false;
    }
  }

  async flush() {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Cache Flush Error:', error);
      return false;
    }
  }

  // Cache middleware for Express
  cacheMiddleware(ttl = 3600) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      const cachedResponse = await this.get(key);

      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json method
      res.json = function (body) {
        this.set(key, body, ttl);
        return originalJson.call(this, body);
      };

      next();
    };
  }
}

const cacheService = new CacheService();
module.exports = cacheService; 