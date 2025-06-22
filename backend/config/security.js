import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import xss from 'xss-clean';
import hpp from 'hpp';
import logger from './logger.js';

const securityMiddleware = (app) => {
  // Basic security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // XSS protection
  app.use(xss());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Security logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Error handling for security-related issues
  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      logger.warn('Unauthorized access attempt:', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    next(err);
  });
};

export default securityMiddleware; 