import rateLimit from 'express-rate-limit';
import redisClient from '../db/redis.js';

// Create a custom RedisStore class that works with Redis v4+
class CustomRedisStore {
    constructor(options) {
        this.client = options.client;
        this.prefix = options.prefix || 'rl:';
    }

    async increment(key) {
        const prefixedKey = this.prefix + key;
        
        // Increment the counter
        const currentValue = await this.client.incr(prefixedKey);
        
        // Set expiry on first request
        if (currentValue === 1) {
            await this.client.expire(prefixedKey, 900); // 15 minutes in seconds
        }

        // Get remaining time
        const ttl = await this.client.ttl(prefixedKey);
        
        return {
            totalHits: currentValue,
            resetTime: new Date(Date.now() + (ttl * 1000))
        };
    }

    async decrement(key) {
        const prefixedKey = this.prefix + key;
        return await this.client.decr(prefixedKey);
    }

    async resetKey(key) {
        const prefixedKey = this.prefix + key;
        return await this.client.del(prefixedKey);
    }
}

// Create a limiter for authentication routes
export const authLimiter = rateLimit({
    store: new CustomRedisStore({
        client: redisClient,
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => req.ip + ':' + req.originalUrl,
});

// Create a limiter for registration routes
export const registerLimiter = rateLimit({
    store: new CustomRedisStore({
        client: redisClient,
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 registration attempts per hour
    message: {
        status: 'error',
        message: 'Too many registration attempts, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + ':' + req.originalUrl,
}); 