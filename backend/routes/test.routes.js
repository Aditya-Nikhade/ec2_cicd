// backend/routes/test.routes.js
import express from 'express';
import redisClient, { testConnection } from '../db/redis.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Only allow test routes in test/development environment
const testEnvOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      error: 'Test routes are only available in test/development environment' 
    });
  }
};

// Test Redis connection
router.get('/redis-status', testEnvOnly, async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        success: true, 
        status: 'connected',
        url: redisClient.options.url,
        database: redisClient.options.url.split('/').pop() || '0'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Could not connect to Redis' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Redis connection error', 
      details: error.message 
    });
  }
});

// Clear Redis cache
router.post('/clear-cache', testEnvOnly, async (req, res) => {
  try {
    await redisClient.flushDb();
    res.json({ 
      success: true, 
      message: 'Redis cache cleared',
      database: redisClient.options.url.split('/').pop() || '0'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear cache',
      details: error.message 
    });
  }
});

// Get cache stats
router.get('/cache-stats', testEnvOnly, async (req, res) => {
  try {
    const stats = await redisClient.info('stats');
    const memory = await redisClient.info('memory');
    
    // Parse Redis INFO command output
    const parseInfo = (infoStr) => {
      const result = {};
      infoStr.split('\r\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key.trim()] = value.trim();
          }
        }
      });
      return result;
    };

    res.json({
      success: true,
      stats: parseInfo(stats),
      memory: parseInfo(memory),
      database: redisClient.options.url.split('/').pop() || '0'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get cache stats',
      details: error.message 
    });
  }
});

// Generate test messages (protected route)
router.post('/seed-messages', protectRoute, testEnvOnly, async (req, res) => {
  try {
    const { conversationId, count = 10 } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    const messages = Array.from({ length: count }, (_, i) => ({
      conversationId,
      sender: req.user._id,
      message: `Test message ${i + 1} - ${new Date().toISOString()}`,
      createdAt: new Date()
    }));

    const result = await Message.insertMany(messages);
    
    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messages[messages.length - 1].message,
      lastMessageAt: new Date()
    });

    res.json({
      success: true,
      count: result.length,
      conversationId,
      messages: result.map(m => ({
        id: m._id,
        message: m.message,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Error seeding messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed messages',
      details: error.message 
    });
  }
});

export default router;