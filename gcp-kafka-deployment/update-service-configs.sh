#!/bin/bash

# Service Configuration Update Script
# This script updates all microservices to use the deployed Kafka instance

KAFKA_SERVER_IP=$1

if [ -z "$KAFKA_SERVER_IP" ]; then
    echo "❌ Error: Kafka server IP not provided"
    echo "Usage: $0 <kafka_server_ip>"
    echo "Example: $0 34.123.45.67"
    exit 1
fi

echo "🔧 Updating microservices to use Kafka server: $KAFKA_SERVER_IP"
echo "=============================================================="

BASE_DIR="../backend"

# Function to update application.properties
update_service_config() {
    local service_name=$1
    local service_path="$BASE_DIR/$service_name/src/main/resources/application.properties"
    
    if [ -f "$service_path" ]; then
        echo "📝 Updating $service_name..."
        
        # Backup original file
        cp "$service_path" "$service_path.backup"
        
        # Update Kafka bootstrap servers
        sed -i "s/spring\.kafka\.bootstrap-servers=localhost:9092/spring.kafka.bootstrap-servers=$KAFKA_SERVER_IP:9092/g" "$service_path"
        sed -i "s/spring\.kafka\.bootstrap-servers=localhost:9092/spring.kafka.bootstrap-servers=$KAFKA_SERVER_IP:9092/g" "$service_path"
        
        echo "  ✅ Updated $service_name configuration"
    else
        echo "  ⚠️ Configuration file not found for $service_name"
    fi
}

# Update all services
echo "🔄 Updating service configurations..."

update_service_config "Orderservice"
update_service_config "productservice" 
update_service_config "notificationservice"
update_service_config "resourseservice"
update_service_config "userservice"

# Update docker-compose files if they exist
echo ""
echo "🐳 Updating Docker Compose configurations..."

# Update main docker-compose.yml
DOCKER_COMPOSE_FILE="../docker-compose.yml"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    echo "📝 Updating main docker-compose.yml..."
    cp "$DOCKER_COMPOSE_FILE" "$DOCKER_COMPOSE_FILE.backup"
    sed -i "s/KAFKA_ADVERTISED_LISTENERS: PLAINTEXT:\/\/localhost:9092/KAFKA_ADVERTISED_LISTENERS: PLAINTEXT:\/\/$KAFKA_SERVER_IP:9092/g" "$DOCKER_COMPOSE_FILE"
    echo "  ✅ Updated main docker-compose.yml"
fi

# Update user service docker-compose
USER_SERVICE_DOCKER="../backend/userservice/docker-compose.yml"
if [ -f "$USER_SERVICE_DOCKER" ]; then
    echo "📝 Updating userservice docker-compose.yml..."
    cp "$USER_SERVICE_DOCKER" "$USER_SERVICE_DOCKER.backup"
    sed -i "s/SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092/SPRING_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER_IP:9092/g" "$USER_SERVICE_DOCKER"
    echo "  ✅ Updated userservice docker-compose.yml"
fi

echo ""
echo "✅ Configuration update completed!"
echo ""
echo "📋 Summary of changes:"
echo "  - Updated Kafka bootstrap servers to: $KAFKA_SERVER_IP:9092"
echo "  - Created backup files with .backup extension"
echo "  - Updated application.properties for all services"
echo "  - Updated Docker Compose files"
echo ""
echo "🚀 Next steps:"
echo "1. Rebuild your Docker images with the new configuration"
echo "2. Redeploy your services to Cloud Run"
echo "3. Test the Kafka connectivity using: ./test-kafka-connection.sh $KAFKA_SERVER_IP"
echo ""
echo "📝 Example rebuild commands:"
echo "   cd ../backend/Orderservice && docker build -t orderservice:latest ."
echo "   cd ../backend/productservice && docker build -t productservice:latest ."
echo "   # ... repeat for other services"