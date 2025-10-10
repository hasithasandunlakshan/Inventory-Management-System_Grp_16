#!/bin/bash

# Test Kafka Connection Script
# Run this script to test connectivity to your deployed Kafka instance

KAFKA_SERVER="$1"

if [ -z "$KAFKA_SERVER" ]; then
    echo "Usage: $0 <kafka-server-ip>"
    echo "Example: $0 34.123.45.67"
    exit 1
fi

KAFKA_ENDPOINT="$KAFKA_SERVER:9092"

echo "🧪 Testing Kafka connectivity to $KAFKA_ENDPOINT"
echo "==============================================="

# Test 1: Port connectivity
echo "1️⃣ Testing port connectivity..."
if nc -z -v -w5 $KAFKA_SERVER 9092 2>/dev/null; then
    echo "✅ Port 9092 is accessible"
else
    echo "❌ Port 9092 is not accessible"
    echo "   Check firewall rules and VM status"
    exit 1
fi

# Test 2: Kafka UI accessibility
echo ""
echo "2️⃣ Testing Kafka UI accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$KAFKA_SERVER:8088 --connect-timeout 10)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Kafka UI is accessible at http://$KAFKA_SERVER:8088"
else
    echo "⚠️ Kafka UI not accessible (HTTP Status: $HTTP_STATUS)"
fi

# Test 3: Create a test topic using Docker (if available)
echo ""
echo "3️⃣ Testing topic creation..."
echo "Note: This requires Docker to be available locally"

if command -v docker &> /dev/null; then
    # Run a temporary Kafka client container to test
    docker run --rm -it confluentinc/cp-kafka:7.4.0 \
        kafka-topics --create \
        --topic test-connection-topic \
        --bootstrap-server $KAFKA_ENDPOINT \
        --partitions 1 \
        --replication-factor 1 \
        --if-not-exists
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully created test topic"
        
        # List topics
        echo ""
        echo "📋 Available topics:"
        docker run --rm -it confluentinc/cp-kafka:7.4.0 \
            kafka-topics --list --bootstrap-server $KAFKA_ENDPOINT
    else
        echo "❌ Failed to create test topic"
    fi
else
    echo "⚠️ Docker not available - skipping topic creation test"
fi

echo ""
echo "🎯 Connection test completed!"
echo "Use this connection string in your Spring Boot services:"
echo "spring.kafka.bootstrap-servers=$KAFKA_ENDPOINT"