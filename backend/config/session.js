const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const logger = require('./logger');

const initSession = async (app) => {
  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  await redisClient.connect();

  // Session configuration
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
      },
      name: 'sessionId', // Change default connect.sid
    })
  );

  // Session middleware
  app.use((req, res, next) => {
    if (!req.session) {
      return next(new Error('Session not available'));
    }
    next();
  });

  return redisClient;
};

module.exports = initSession; 