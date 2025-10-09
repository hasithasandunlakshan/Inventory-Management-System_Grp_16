#!/bin/bash

# VM Setup Script - Runs on the Kafka VM
# This script installs Docker, Docker Compose, and starts Kafka

EXTERNAL_IP=$1

if [ -z "$EXTERNAL_IP" ]; then
    echo "❌ Error: External IP not provided"
    exit 1
fi

echo "🚀 Setting up Kafka server on VM..."
echo "📍 External IP: $EXTERNAL_IP"

# Update system
echo "🔄 Updating system packages..."
sudo apt-get update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Create kafka directory
mkdir -p ~/kafka-data
mkdir -p ~/zookeeper-data

# Update docker-compose.yml with external IP
sed -i "s/EXTERNAL_IP_PLACEHOLDER/$EXTERNAL_IP/g" ~/docker-compose.yml

# Start Kafka services
echo "▶️ Starting Kafka services..."
cd ~
sudo docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 60

# Check if services are running
echo "🔍 Checking service status..."
sudo docker-compose ps

echo "✅ Kafka setup completed!"
echo ""
echo "🌐 Services accessible at:"
echo "   Kafka: $EXTERNAL_IP:9092"
echo "   Zookeeper: $EXTERNAL_IP:2181" 
echo "   Kafka UI: http://$EXTERNAL_IP:8088"
echo ""

# Create all required Kafka topics for the Inventory Management System
echo "📝 Creating Kafka topics for Inventory Management System..."
sleep 30

echo "Creating Order Service topics..."
# Order Service -> Product Service (inventory reservation)
sudo docker exec kafka kafka-topics --create --topic inventory-reservation-request --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 || true

# Product Service -> Order Service (inventory reservation response)  
sudo docker exec kafka kafka-topics --create --topic inventory-reservation-response --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 || true

# Order Service -> Notification Service (order notifications)
sudo docker exec kafka kafka-topics --create --topic order-notifications --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 || true

echo "Creating Resource Service topics..."
# Resource Service -> User Service (driver profile events)
sudo docker exec kafka kafka-topics --create --topic driver-profile-created-events --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1 || true

echo "Creating Notification Service topics..."
# Inventory notifications
sudo docker exec kafka kafka-topics --create --topic inventory-notifications --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1 || true

# Payment notifications
sudo docker exec kafka kafka-topics --create --topic payment-notifications --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1 || true

echo "Creating additional system topics..."
# User events (future use)
sudo docker exec kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1 || true

# Product stock updates (future use)
sudo docker exec kafka kafka-topics --create --topic product-stock-updates --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 || true

# Order status updates
sudo docker exec kafka kafka-topics --create --topic order-status-updates --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 || true

echo "✅ All Kafka topics created successfully!"

# List topics
echo "📋 Available topics:"
sudo docker exec kafka kafka-topics --list --bootstrap-server localhost:9092