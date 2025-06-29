import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

await redisClient.connect();

// Online users operations
export const addOnlineUser = async (userId) => {
    await redisClient.sAdd('online_users', userId);
};

export const removeOnlineUser = async (userId) => {
    await redisClient.sRem('online_users', userId);
};

export const getOnlineUsers = async () => {
    return await redisClient.sMembers('online_users');
};

// Message caching operations
const MESSAGE_CACHE_SIZE = 50; // Keep last 50 messages per conversation

export const cacheMessages = async (conversationId, messages) => {
    const key = `messages:${conversationId}`;
    // Clear existing messages
    await redisClient.del(key);
    // Add new messages to the list
    if (messages.length > 0) {
        const messageStrings = messages.map(msg => JSON.stringify(msg));
        await redisClient.rPush(key, messageStrings);
        // Trim to keep only the last MESSAGE_CACHE_SIZE messages
        await redisClient.lTrim(key, -MESSAGE_CACHE_SIZE, -1);
    }
};

export const getCachedMessages = async (conversationId) => {
    const key = `messages:${conversationId}`;
    const messages = await redisClient.lRange(key, 0, -1);
    return messages.map(msg => JSON.parse(msg));
};

export const addMessageToCache = async (conversationId, message) => {
    const key = `messages:${conversationId}`;
    await redisClient.rPush(key, JSON.stringify(message));
    // Trim to keep only the last MESSAGE_CACHE_SIZE messages
    await redisClient.lTrim(key, -MESSAGE_CACHE_SIZE, -1);
};

export const clearMessageCache = async (conversationId) => {
    const key = `messages:${conversationId}`;
    await redisClient.del(key);
};

export default redisClient; 