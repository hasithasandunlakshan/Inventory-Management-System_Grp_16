#!/bin/bash

# Stop Script for Kafka-based Inventory Management System

echo "🛑 Stopping Kafka-based Inventory Management System..."

# Function to stop Spring Boot services
stop_services() {
    echo "🔄 Stopping Spring Boot services..."
    
    if [ -f .product-service.pid ]; then
        PRODUCT_PID=$(cat .product-service.pid)
        if ps -p $PRODUCT_PID > /dev/null; then
            echo "🛍️  Stopping Product Service (PID: $PRODUCT_PID)..."
            kill $PRODUCT_PID
        fi
        rm .product-service.pid
    fi
    
    if [ -f .order-service.pid ]; then
        ORDER_PID=$(cat .order-service.pid)
        if ps -p $ORDER_PID > /dev/null; then
            echo "📦 Stopping Order Service (PID: $ORDER_PID)..."
            kill $ORDER_PID
        fi
        rm .order-service.pid
    fi
    
    # Also kill any remaining Java processes for these services
    pkill -f "productservice"
    pkill -f "Orderservice"
}

# Function to stop Kafka containers
stop_kafka() {
    echo "📦 Stopping Kafka containers..."
    docker-compose down
}

# Main execution
main() {
    stop_services
    stop_kafka
    
    echo "✅ All services stopped successfully!"
}

# Run main function
main
