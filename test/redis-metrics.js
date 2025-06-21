import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: REDIS_URL });

const NUM_USERS = 100;
const NUM_MESSAGES = 500;
const CONVERSATION_ID = 'testconv123';
const MESSAGE_CACHE_KEY = `messages:${CONVERSATION_ID}`;
const ONLINE_USERS_KEY = 'online_users';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await redisClient.connect();
  console.log('Connected to Redis');

  // --- Simulate Online Users ---
  console.time('AddOnlineUsers');
  for (let i = 0; i < NUM_USERS; i++) {
    await redisClient.sAdd(ONLINE_USERS_KEY, `user${i}`);
  }
  console.timeEnd('AddOnlineUsers');

  const onlineCount = await redisClient.sCard(ONLINE_USERS_KEY);
  console.log(`Online users tracked in Redis: ${onlineCount}`);

  // --- Simulate Message Caching ---
  // Clear previous cache
  await redisClient.del(MESSAGE_CACHE_KEY);

  let cacheHits = 0;
  let cacheMisses = 0;
  let totalFetchTime = 0;

  // Pre-populate cache with some messages
  for (let i = 0; i < 50; i++) {
    await redisClient.lPush(MESSAGE_CACHE_KEY, JSON.stringify({ sender: `user${i%NUM_USERS}`, text: `Hello ${i}` }));
  }
  await redisClient.lTrim(MESSAGE_CACHE_KEY, 0, 49);

  // Simulate fetching messages (some hits, some misses)
  for (let i = 0; i < NUM_MESSAGES; i++) {
    const start = Date.now();
    const cached = await redisClient.lRange(MESSAGE_CACHE_KEY, 0, -1);
    const elapsed = Date.now() - start;
    totalFetchTime += elapsed;
    if (cached && cached.length > 0) {
      cacheHits++;
    } else {
      cacheMisses++;
      // Simulate fetching from DB and repopulating cache
      await redisClient.lPush(MESSAGE_CACHE_KEY, JSON.stringify({ sender: `user${i%NUM_USERS}`, text: `DB message ${i}` }));
      await redisClient.lTrim(MESSAGE_CACHE_KEY, 0, 49);
    }
    // Simulate some delay
    if (i % 100 === 0) await sleep(10);
  }

  // --- Throughput Test ---
  console.time('ThroughputTest');
  let ops = 0;
  const throughputStart = Date.now();
  while (Date.now() - throughputStart < 1000) { // 1 second
    await redisClient.ping();
    ops++;
  }
  console.timeEnd('ThroughputTest');

  // --- Print Summary ---
  console.log('\n--- Redis Metrics Summary ---');
  console.log(`Cache hit rate: ${(cacheHits / NUM_MESSAGES * 100).toFixed(2)}% (${cacheHits}/${NUM_MESSAGES})`);
  console.log(`Cache miss rate: ${(cacheMisses / NUM_MESSAGES * 100).toFixed(2)}% (${cacheMisses}/${NUM_MESSAGES})`);
  console.log(`Average Redis fetch latency: ${(totalFetchTime / NUM_MESSAGES).toFixed(2)} ms`);
  console.log(`Online users tracked: ${onlineCount}`);
  console.log(`Redis throughput (PING ops/sec): ${ops}`);

  // Cleanup
  await redisClient.del(MESSAGE_CACHE_KEY);
  await redisClient.del(ONLINE_USERS_KEY);
  await redisClient.quit();
}

main().catch((err) => {
  console.error('Error running redis-metrics test:', err);
  process.exit(1);
}); 