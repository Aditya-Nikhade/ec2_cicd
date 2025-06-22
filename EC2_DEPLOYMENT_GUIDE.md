# EC2 Deployment Guide for demoChat

## ✅ **Project Status: READY FOR DEPLOYMENT**

After fixing the critical issues, your project is now ready for EC2 deployment.

## Prerequisites

1. **AWS EC2 Instance** (t2.micro or larger recommended)
2. **Security Group** with ports 80 (HTTP) and 22 (SSH) open
3. **External Database** (MongoDB Atlas, Redis Cloud) - Recommended for production
4. **Domain Name** (optional but recommended)

## Step-by-Step Deployment

### 1. EC2 Instance Setup

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
exit
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 2. Application Deployment

```bash
# Create application directory
mkdir -p /home/ec2-user/demoChat
cd /home/ec2-user/demoChat

# Clone your repository
git clone https://github.com/yourusername/demoChat.git .
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.production.template .env

# Edit environment variables
nano .env
```

**Required Environment Variables for EC2:**

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Choose one)
# Option A: External MongoDB (Recommended)
MONGO_DB_URI=mongodb+srv://username:password@your-mongodb-cluster.mongodb.net/demo-chat

# Option B: Local MongoDB (For testing only)
# MONGO_DB_URI=mongodb://admin:password123@mongodb:27017/demo-chat

# MongoDB Root Credentials (if using local MongoDB)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password

# Redis Configuration (Choose one)
# Option A: External Redis (Recommended)
REDIS_URL=redis://default:your_password@your_redis_endpoint:port

# Option B: Local Redis (For testing only)
# REDIS_URL=redis://:your_redis_password@redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-immediately

# CORS Configuration - CRITICAL FOR EC2
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP
# CORS_ORIGIN=https://yourdomain.com

# Optional: AWS S3 for file uploads
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Optional: Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Database Setup

#### Option A: External Services (Recommended for Production)

**MongoDB Atlas:**
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGO_DB_URI` in `.env`

**Redis Cloud:**
1. Create free instance at [Redis Cloud](https://redis.com/try-free/)
2. Get connection string
3. Update `REDIS_URL` in `.env`

#### Option B: Local Docker (For Testing)

If using local services, uncomment the services in `docker-compose.yml`:

```yaml
# Uncomment these lines in docker-compose.yml
mongodb:
  image: mongo:latest
  # ... rest of config

redis:
  image: redis:alpine
  # ... rest of config
```

### 5. Deploy Application

```bash
# Make deployment script executable
chmod +x deploy-ec2.sh

# Run deployment script
./deploy-ec2.sh

# Or manually:
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### 6. Verify Deployment

```bash
# Check container status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f

# Test application
curl http://localhost
```

## Port Configuration Summary

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| **Frontend (Nginx)** | 80 | 80 | Main application entry point |
| **Backend (Node.js)** | 5000 | 5000 | API server (internal only) |
| **MongoDB** | 27017 | - | Database (internal only) |
| **Redis** | 6379 | - | Cache (internal only) |

## Security Checklist

- [ ] Changed default MongoDB password
- [ ] Changed default Redis password
- [ ] Used strong JWT secret
- [ ] Updated CORS_ORIGIN with actual EC2 IP
- [ ] Configured security groups properly
- [ ] Used external databases for production

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check `CORS_ORIGIN` in `.env` matches your EC2 IP
   - Verify no trailing slashes in the URL

2. **Database Connection Issues:**
   - Verify connection strings
   - Check security group rules
   - Test connectivity manually

3. **Container Won't Start:**
   ```bash
   sudo docker-compose logs [service-name]
   ```

4. **Port 80 Already in Use:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop httpd  # if Apache is running
   ```

## Production Recommendations

1. **Use HTTPS**: Set up SSL certificate with Let's Encrypt
2. **Load Balancer**: Use AWS ALB for high availability
3. **Auto Scaling**: Configure auto scaling groups
4. **Monitoring**: Set up CloudWatch alarms
5. **Backup**: Implement automated backup strategy
6. **CDN**: Use CloudFront for static assets

## Quick Deployment Commands

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/demoChat.git
cd demoChat
cp env.production.template .env
nano .env  # Edit with your values

# 2. Deploy
sudo docker-compose up -d --build

# 3. Check status
sudo docker-compose ps
sudo docker-compose logs -f
```

## Access Your Application

Once deployed, your application will be available at:
- **http://YOUR_EC2_PUBLIC_IP** (replace with your actual EC2 public IP)

The frontend will be served on port 80, and all API requests will be automatically proxied to the backend running on port 5000. 