#!/bin/bash

# EC2 Deployment Script for demoChat Application
# Run this script on your EC2 instance

echo "🚀 Starting EC2 deployment for demoChat..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /home/ec2-user/demoChat
cd /home/ec2-user/demoChat

# Copy your application files here (you'll need to upload them)
# Or clone from your repository:
# git clone https://github.com/yourusername/demoChat.git .

# Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.production.template .env
    echo "⚠️  Please edit .env file with your production values!"
    echo "   - Update EC2 public IP"
    echo "   - Update database URIs"
    echo "   - Update JWT secret"
    echo "   - Update other credentials"
fi

# Build and start containers
echo "🔨 Building and starting containers..."
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Check container status
echo "📊 Checking container status..."
sudo docker-compose ps

# Show logs
echo "📝 Recent logs:"
sudo docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at: http://YOUR_EC2_PUBLIC_IP"
echo "🔧 To view logs: sudo docker-compose logs -f"
echo "🛑 To stop: sudo docker-compose down" 