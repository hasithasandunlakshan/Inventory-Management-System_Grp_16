#!/bin/bash

echo "=========================================="
echo "Starting Kafka in GitHub Codespaces"
echo "=========================================="
echo ""

# Start Kafka services
echo "Starting Kafka services..."
docker-compose -f docker-compose-codespaces.yml up -d

echo ""
echo "Waiting for services to initialize (30 seconds)..."
sleep 30

# Check service status
echo ""
echo "Service Status:"
docker-compose -f docker-compose-codespaces.yml ps

# Create topics
echo ""
echo "Creating Kafka topics..."
sleep 10

echo "Creating Order Service topics..."
docker exec kafka kafka-topics --create --topic inventory-reservation-request --bootstrap-server localhost:29092 --partitions 3 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

docker exec kafka kafka-topics --create --topic inventory-reservation-response --bootstrap-server localhost:29092 --partitions 3 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

docker exec kafka kafka-topics --create --topic order-notifications --bootstrap-server localhost:29092 --partitions 3 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

echo "Creating Resource Service topics..."
docker exec kafka kafka-topics --create --topic driver-profile-created-events --bootstrap-server localhost:29092 --partitions 2 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

echo "Creating Notification Service topics..."
docker exec kafka kafka-topics --create --topic inventory-notifications --bootstrap-server localhost:29092 --partitions 2 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

docker exec kafka kafka-topics --create --topic payment-notifications --bootstrap-server localhost:29092 --partitions 2 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

echo "Creating additional system topics..."
docker exec kafka kafka-topics --create --topic user-events --bootstrap-server localhost:29092 --partitions 2 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

docker exec kafka kafka-topics --create --topic product-stock-updates --bootstrap-server localhost:29092 --partitions 3 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

docker exec kafka kafka-topics --create --topic order-status-updates --bootstrap-server localhost:29092 --partitions 3 --replication-factor 1 2>/dev/null || echo "  ✓ Topic already exists"

# List all topics
echo ""
echo "Available Kafka Topics:"
docker exec kafka kafka-topics --list --bootstrap-server localhost:29092

echo ""
echo "=========================================="
echo "✓ Kafka Setup Complete!"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  Kafka (Internal): kafka:29092"
echo "  Kafka (External): localhost:9092"
echo "  Kafka UI: Check Ports tab for forwarded URL"
echo ""
echo "For Spring Boot applications, use:"
echo "  spring.kafka.bootstrap-servers=localhost:9092"
echo ""
echo "To stop services:"
echo "  docker-compose -f docker-compose-codespaces.yml down"
