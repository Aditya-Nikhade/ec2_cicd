// test/redis-benchmark.js
import { performance } from 'node:perf_hooks';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = { username: 'testuser', password: 'testpass123' };
let authToken = '';
const conversationId = 'test-convo-' + uuidv4(); // Unique conversation ID for testing

// Configure axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Test parameters
const NUM_MESSAGES = 50;
const NUM_REQUESTS = 30;

async function login() {
  try {
    console.log('Logging in test user...');
    const response = await api.post('/auth/login', TEST_USER);
    authToken = response.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('Login successful');
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function sendTestMessages() {
  console.log(`Sending ${NUM_MESSAGES} test messages...`);
  const messages = [];
  
  for (let i = 0; i < NUM_MESSAGES; i++) {
    try {
      const response = await api.post(`/messages/${conversationId}`, {
        message: `Test message ${i} - ${uuidv4()}`
      });
      messages.push(response.data);
      process.stdout.write(`\rSent ${i + 1}/${NUM_MESSAGES} messages`);
    } catch (error) {
      console.error(`\nError sending message ${i}:`, error.response?.data || error.message);
    }
  }
  console.log('\nTest messages sent');
  return messages;
}

async function clearCache() {
  try {
    await api.post('/test/clear-cache');
    console.log('Cache cleared');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error.response?.data || error.message);
    return false;
  }
}

async function testEndpoint(endpoint, useCache = true) {
  const times = [];
  const errors = [];
  
  console.log(`\nTesting ${endpoint} (${useCache ? 'with cache' : 'without cache'})...`);
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    try {
      const start = performance.now();
      await api.get(`${endpoint}${useCache ? '' : '?cache=false'}`);
      const end = performance.now();
      times.push(end - start);
      process.stdout.write(`\rRequest ${i + 1}/${NUM_REQUESTS}`);
    } catch (error) {
      errors.push(error);
      process.stdout.write('E');
    }
  }
  
  console.log('\n');
  return { times, errors };
}

function calculateStats(times) {
  if (times.length === 0) return null;
  
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sorted = [...times].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  
  return {
    count: times.length,
    avg,
    min,
    max,
    p95,
    total: sum
  };
}

async function runTest() {
  try {
    // 1. Login
    if (!await login()) {
      console.error('Cannot proceed without authentication');
      return;
    }

    // 2. Clear cache and test without caching
    await clearCache();
    const noCache = await testEndpoint(`/messages/${conversationId}`, false);
    
    // 3. Test with caching (first run will populate cache)
    const cacheFirstRun = await testEndpoint(`/messages/${conversationId}`, true);
    
    // 4. Test with warm cache
    const cacheWarm = await testEndpoint(`/messages/${conversationId}`, true);
    
    // 5. Send test messages (after initial tests to avoid interference)
    await sendTestMessages();
    
    // 6. Test with more data
    const withData = await testEndpoint(`/messages/${conversationId}`, true);

    // Calculate statistics
    const stats = {
      noCache: calculateStats(noCache.times),
      cacheFirstRun: calculateStats(cacheFirstRun.times),
      cacheWarm: calculateStats(cacheWarm.times),
      withData: calculateStats(withData.times)
    };

    // Print results
    console.log('\n=== Performance Results ===\n');
    console.log('No Cache:'.padEnd(20), `${stats.noCache.avg.toFixed(2)}ms avg, ${stats.noCache.p95.toFixed(2)}ms p95`);
    console.log('Cache First Run:'.padEnd(20), `${stats.cacheFirstRun.avg.toFixed(2)}ms avg, ${stats.cacheFirstRun.p95.toFixed(2)}ms p95`);
    console.log('Warm Cache:'.padEnd(20), `${stats.cacheWarm.avg.toFixed(2)}ms avg, ${stats.cacheWarm.p95.toFixed(2)}ms p95`);
    console.log('With Data:'.padEnd(20), `${stats.withData.avg.toFixed(2)}ms avg, ${stats.withData.p95.toFixed(2)}ms p95`);

    // Calculate improvements
    const improvementFirstRun = ((stats.noCache.avg - stats.cacheFirstRun.avg) / stats.noCache.avg * 100).toFixed(1);
    const improvementWarm = ((stats.noCache.avg - stats.cacheWarm.avg) / stats.noCache.avg * 100).toFixed(1);
    
    console.log('\n=== Improvements ===\n');
    console.log('First Run Improvement:'.padEnd(25), `${improvementFirstRun}% faster than no cache`);
    console.log('Warm Cache Improvement:'.padEnd(25), `${improvementWarm}% faster than no cache`);

    // Save results to file
    const results = {
      timestamp: new Date().toISOString(),
      parameters: { NUM_MESSAGES, NUM_REQUESTS, conversationId },
      stats,
      improvements: {
        firstRun: parseFloat(improvementFirstRun),
        warmCache: parseFloat(improvementWarm)
      }
    };

    const fs = await import('fs');
    await fs.promises.writeFile(
      `redis-benchmark-${Date.now()}.json`,
      JSON.stringify(results, null, 2)
    );

    console.log('\nResults saved to JSON file');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();