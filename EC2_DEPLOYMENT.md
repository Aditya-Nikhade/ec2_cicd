# EC2 Deployment Guide for demoChat

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

# Upload your application files (using scp or git clone)
# Option 1: Upload files using scp
scp -r -i your-key.pem ./demoChat/* ec2-user@YOUR_EC2_PUBLIC_IP:/home/ec2-user/demoChat/

# Option 2: Clone from repository
git clone https://github.com/yourusername/demoChat.git .
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.production.template .env

# Edit environment variables
nano .env
```

**Update these values in `.env`:**
- `YOUR_EC2_PUBLIC_IP` → Your actual EC2 public IP
- `MONGO_DB_URI` → Your MongoDB connection string
- `REDIS_URL` → Your Redis connection string
- `JWT_SECRET` → A strong random secret
- Other credentials as needed

### 4. Update CORS Configuration

Edit `backend/src/index.js` and update the `allowedOrigins` array:

```javascript
const allowedOrigins = [
    "http://YOUR_EC2_PUBLIC_IP",
    "http://YOUR_EC2_PUBLIC_IP:80",
    "https://YOUR_DOMAIN.com",  // if you have a domain
];
```

### 5. Database Setup (Choose One)

#### Option A: External Services (Recommended)
- **MongoDB Atlas**: Create a free cluster
- **Redis Cloud**: Create a free Redis instance
- Update URIs in `.env`

#### Option B: Local Docker (For testing)
- Keep MongoDB and Redis services in `docker-compose.yml`
- Update credentials in the file

### 6. Deploy Application

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

### 7. Verify Deployment

```bash
# Check container status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f

# Test application
curl http://localhost
```

## Security Considerations

### 1. Update Default Passwords
- Change MongoDB root password
- Change Redis password
- Use strong JWT secret

### 2. Environment Variables
- Never commit `.env` file to git
- Use AWS Secrets Manager for sensitive data
- Rotate credentials regularly

### 3. Network Security
- Configure security groups properly
- Use HTTPS in production
- Consider using AWS Application Load Balancer

## Monitoring and Maintenance

### View Logs
```bash
# All services
sudo docker-compose logs -f

# Specific service
sudo docker-compose logs -f backend
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Backup Data
```bash
# Backup MongoDB data
sudo docker exec mongodb mongodump --out /backup

# Backup Redis data
sudo docker exec redis redis-cli BGSAVE
```

## Troubleshooting

### Common Issues

1. **Port 80 already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop httpd  # if Apache is running
   ```

2. **Permission denied**
   ```bash
   sudo chown -R ec2-user:ec2-user /home/ec2-user/demoChat
   ```

3. **Container won't start**
   ```bash
   sudo docker-compose logs [service-name]
   ```

4. **Database connection issues**
   - Check security group rules
   - Verify connection strings
   - Test connectivity manually

## Production Recommendations

1. **Use HTTPS**: Set up SSL certificate with Let's Encrypt
2. **Load Balancer**: Use AWS ALB for high availability
3. **Auto Scaling**: Configure auto scaling groups
4. **Monitoring**: Set up CloudWatch alarms
5. **Backup**: Implement automated backup strategy
6. **CDN**: Use CloudFront for static assets

## Support

If you encounter issues:
1. Check container logs: `sudo docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check security group configurations 