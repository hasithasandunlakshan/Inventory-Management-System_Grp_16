#!/bin/bash

# Kafka Setup and Service Startup Script

echo "🚀 Starting Kafka-based Inventory Management System..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to start Kafka
start_kafka() {
    echo "📦 Starting Kafka containers..."
    docker-compose up -d
    
    echo "⏳ Waiting for Kafka to be ready..."
    sleep 30
    
    # Create topics if they don't exist
    echo "📋 Creating Kafka topics..."
    docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic inventory-reservation-request --partitions 3 --replication-factor 1
    docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic inventory-reservation-response --partitions 3 --replication-factor 1
    
    echo "✅ Kafka is ready!"
    echo "🎛️  Kafka UI available at: http://localhost:8080"
}

# Function to build and start services
start_services() {
    echo "🔨 Building and starting services..."
    
    # Start Product Service
    echo "🛍️  Starting Product Service..."
    cd backend/productservice
    ./mvnw clean install -DskipTests
    ./mvnw spring-boot:run > ../../logs/product-service.log 2>&1 &
    PRODUCT_SERVICE_PID=$!
    cd ../..
    
    # Wait a bit before starting next service
    sleep 10
    
    # Start Order Service
    echo "📦 Starting Order Service..."
    cd backend/Orderservice
    ./mvnw clean install -DskipTests
    ./mvnw spring-boot:run > ../../logs/order-service.log 2>&1 &
    ORDER_SERVICE_PID=$!
    cd ../..
    
    # Save PIDs for cleanup
    echo $PRODUCT_SERVICE_PID > .product-service.pid
    echo $ORDER_SERVICE_PID > .order-service.pid
    
    echo "✅ Services are starting..."
    echo "📊 Product Service: http://localhost:8083"
    echo "🛒 Order Service: http://localhost:8084"
    echo "📋 Logs are saved in ./logs/ directory"
}

# Main execution
main() {
    # Create logs directory
    mkdir -p logs
    
    check_docker
    start_kafka
    start_services
    
    echo ""
    echo "🎉 All services are starting up!"
    echo ""
    echo "📊 Service URLs:"
    echo "   - Product Service: http://localhost:8083"
    echo "   - Order Service: http://localhost:8084"
    echo "   - Kafka UI: http://localhost:8080"
    echo ""
    echo "📋 Commands:"
    echo "   - View logs: tail -f logs/product-service.log"
    echo "   - Stop services: ./stop.sh"
    echo "   - Check topics: docker exec kafka kafka-topics --list --bootstrap-server localhost:9092"
    echo ""
}

# Run main function
main
