// Import statements.
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('../config/database');
const securityMiddleware = require('../config/security');
const initSession = require('../config/session');
const logger = require('../config/logger');
const cacheService = require('../config/cache');

const app = express();

// Initialize security middleware
securityMiddleware(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('combined', { stream: logger.stream }));

// Initialize session
let redisClient;
(async () => {
  redisClient = await initSession(app);
  await cacheService.connect();
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; 