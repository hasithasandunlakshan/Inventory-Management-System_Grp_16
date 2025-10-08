#!/bin/bash

# Build and Deploy API Gateway to Oracle VM using Docker
# This script should be run on your Oracle VM

echo "=== API Gateway Docker Deployment Script ==="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing Docker..."
    
    # Update system packages
    sudo yum update -y
    
    # Install Docker
    sudo yum install -y docker
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "Docker installed successfully. Please log out and log back in for group changes to take effect."
    echo "Then run this script again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Installing Docker Compose..."
    
    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symbolic link
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    echo "Docker Compose installed successfully."
fi

# Create inventory network if it doesn't exist
echo "Creating Docker network..."
docker network create inventory-network 2>/dev/null || echo "Network already exists"

# Build the Docker image
echo "Building API Gateway Docker image..."
docker build -t api-gateway:latest .

# Stop and remove existing container if running
echo "Stopping existing container..."
docker-compose down 2>/dev/null || true

# Start the service
echo "Starting API Gateway service..."
docker-compose up -d

# Check if the service is running
echo "Checking service status..."
sleep 10
docker-compose ps

# Show logs
echo "Showing recent logs..."
docker-compose logs --tail=50 api-gateway

echo "=== Deployment Complete ==="
echo "API Gateway is now running on port 8090"
echo "Access it at: http://$(hostname -I | awk '{print $1}'):8090"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f api-gateway"
echo "  - Stop service: docker-compose down"
echo "  - Restart service: docker-compose restart"
echo "  - View status: docker-compose ps"