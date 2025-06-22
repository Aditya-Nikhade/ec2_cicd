# External Redis Setup Guide for demoChat

## Why Use External Redis?

- **Scalability**: Handle more concurrent users
- **Reliability**: Managed service with high availability
- **Performance**: Optimized Redis instances
- **Security**: Better security and access control
- **Cost-effective**: Pay only for what you use

## Option 1: Redis Cloud (Recommended - Free Tier Available)

### Step 1: Create Redis Cloud Account
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up for a free account
3. Create a new database

### Step 2: Configure Database
1. **Database Name**: `demoChat-redis`
2. **Region**: Choose closest to your EC2 instance
3. **Database Size**: 30MB (free tier)
4. **Password**: Generate a strong password

### Step 3: Get Connection Details
After creation, you'll get:
- **Endpoint**: `redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345`
- **Password**: `your_generated_password`

### Step 4: Update Environment Variables
```bash
# In your .env file
REDIS_URL=redis://default:your_generated_password@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

## Option 2: Upstash Redis (Free Tier Available)

### Step 1: Create Upstash Account
1. Go to [Upstash](https://upstash.com/)
2. Sign up for free account
3. Create a new Redis database

### Step 2: Configure Database
1. **Database Name**: `demoChat-redis`
2. **Region**: Choose closest to your EC2 instance
3. **TLS**: Enable for security

### Step 3: Get Connection Details
You'll receive:
- **Endpoint**: `your-db-name.upstash.io:12345`
- **Password**: `your_password`

### Step 4: Update Environment Variables
```bash
# In your .env file
REDIS_URL=redis://default:your_password@your-db-name.upstash.io:12345
```

## Option 3: AWS ElastiCache (If using AWS)

### Step 1: Create ElastiCache Cluster
1. Go to AWS ElastiCache Console
2. Create Redis cluster
3. Configure security groups
4. Set up subnet groups

### Step 2: Configure Security
1. **Security Group**: Allow port 6379 from your EC2 instance
2. **Subnet**: Use same VPC as your EC2 instance

### Step 3: Get Connection Details
- **Endpoint**: `your-cluster.xxxxx.cache.amazonaws.com:6379`
- **No password required** (if not configured)

### Step 4: Update Environment Variables
```bash
# In your .env file
REDIS_URL=redis://your-cluster.xxxxx.cache.amazonaws.com:6379
```

## Migration Steps

### Step 1: Set Up External Redis
Choose one of the options above and get your connection details.

### Step 2: Update Configuration Files

#### Update docker-compose.yml:
```yaml
backend:
  environment:
    # COMMENT OUT LOCAL REDIS
    # - REDIS_URL=redis://redis:6379
    
    # UNCOMMENT AND UPDATE EXTERNAL REDIS
    - REDIS_URL=redis://default:your_password@your_endpoint:port
  depends_on:
    - mongodb
    # - redis  # COMMENT OUT THIS LINE
```

#### Comment out Redis service:
```yaml
# redis:
#   image: redis:alpine
#   volumes:
#     - redis_data:/data
#   networks:
#     - app-network
#   command: redis-server --requirepass your_redis_password
```

### Step 3: Test Connection
```bash
# Test Redis connection
node -e "
const { createClient } = require('redis');
const client = createClient({ url: process.env.REDIS_URL });
client.on('error', err => console.log('Redis Error:', err));
client.on('connect', () => console.log('Redis Connected!'));
client.connect().then(() => client.quit());
"
```

### Step 4: Deploy
```bash
# Stop current containers
docker-compose down

# Remove Redis volume (if exists)
docker volume rm demoChat_redis_data

# Start with external Redis
docker-compose up -d
```

## Environment Variables Reference

### For Redis Cloud:
```bash
REDIS_URL=redis://default:password@endpoint:port
REDIS_HOST=endpoint
REDIS_PORT=port
REDIS_PASSWORD=password
```

### For Upstash:
```bash
REDIS_URL=redis://default:password@endpoint:port
REDIS_HOST=endpoint
REDIS_PORT=port
REDIS_PASSWORD=password
```

### For AWS ElastiCache:
```bash
REDIS_URL=redis://endpoint:6379
REDIS_HOST=endpoint
REDIS_PORT=6379
# No password required
```

## Troubleshooting

### Connection Issues
1. **Check endpoint**: Verify the endpoint is correct
2. **Check password**: Ensure password is correct
3. **Check network**: Verify EC2 can reach Redis endpoint
4. **Check security groups**: Ensure port 6379 is open

### Performance Issues
1. **Region**: Choose Redis in same region as EC2
2. **Connection pooling**: Your app already handles this
3. **Memory**: Monitor Redis memory usage

### Security Best Practices
1. **Use strong passwords**
2. **Enable TLS** (if available)
3. **Restrict access** by IP (if supported)
4. **Rotate passwords** regularly

## Monitoring

### Redis Cloud Dashboard
- Monitor memory usage
- Check connection count
- View performance metrics

### Application Logs
```bash
# Check Redis connection logs
docker-compose logs backend | grep Redis
```

### Health Check
```bash
# Test Redis connectivity
curl -X GET http://localhost:5000/api/health
```

## Cost Optimization

### Redis Cloud Free Tier
- 30MB database
- 30 connections
- Perfect for development/small apps

### Upstash Free Tier
- 10,000 requests/day
- 256MB storage
- Good for small to medium apps

### AWS ElastiCache
- Pay per hour
- Good for high-traffic applications
- Integrates well with other AWS services 