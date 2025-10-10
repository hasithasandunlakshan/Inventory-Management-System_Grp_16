#!/bin/bash

# Kafka Topic Management Script
# This script helps manage Kafka topics for the Inventory Management System

KAFKA_BOOTSTRAP_SERVER="localhost:9092"
EXTERNAL_IP=$1

if [ ! -z "$EXTERNAL_IP" ]; then
    KAFKA_BOOTSTRAP_SERVER="$EXTERNAL_IP:9092"
fi

echo "🎯 Kafka Topic Management for Inventory Management System"
echo "Using Kafka server: $KAFKA_BOOTSTRAP_SERVER"
echo "========================================================="

# Function to create a topic
create_topic() {
    local topic_name=$1
    local partitions=$2
    local replication_factor=$3
    local description=$4
    
    echo "Creating topic: $topic_name ($description)"
    if command -v docker >/dev/null 2>&1; then
        docker exec kafka kafka-topics --create \
            --topic "$topic_name" \
            --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
            --partitions "$partitions" \
            --replication-factor "$replication_factor" \
            --if-not-exists
    else
        echo "  ⚠️ Docker not available - topic creation skipped"
    fi
}

# Function to list all topics
list_topics() {
    echo "📋 Listing all Kafka topics:"
    if command -v docker >/dev/null 2>&1; then
        docker exec kafka kafka-topics --list --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER"
    else
        echo "  ⚠️ Docker not available"
    fi
}

# Function to describe a topic
describe_topic() {
    local topic_name=$1
    echo "📊 Describing topic: $topic_name"
    if command -v docker >/dev/null 2>&1; then
        docker exec kafka kafka-topics --describe \
            --topic "$topic_name" \
            --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER"
    else
        echo "  ⚠️ Docker not available"
    fi
}

# Function to delete a topic
delete_topic() {
    local topic_name=$1
    echo "🗑️ Deleting topic: $topic_name"
    read -p "Are you sure you want to delete topic '$topic_name'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v docker >/dev/null 2>&1; then
            docker exec kafka kafka-topics --delete \
                --topic "$topic_name" \
                --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER"
        else
            echo "  ⚠️ Docker not available"
        fi
    else
        echo "Topic deletion cancelled"
    fi
}

# Function to create all system topics
create_all_topics() {
    echo "🚀 Creating all Inventory Management System topics..."
    
    # Core business topics
    create_topic "inventory-reservation-request" 3 1 "Order→Product: Inventory reservation requests"
    create_topic "inventory-reservation-response" 3 1 "Product→Order: Inventory reservation responses"
    create_topic "order-notifications" 3 1 "Order→Notification: Order status notifications" 
    create_topic "driver-profile-created-events" 2 1 "Resource→User: Driver profile creation events"
    create_topic "inventory-notifications" 2 1 "Product→Notification: Inventory notifications"
    create_topic "payment-notifications" 2 1 "Order→Notification: Payment notifications"
    
    # System topics for future use
    create_topic "user-events" 2 1 "User service events"
    create_topic "product-stock-updates" 3 1 "Product stock level updates"
    create_topic "order-status-updates" 3 1 "Real-time order status updates"
    
    echo "✅ All topics created successfully!"
}

# Function to test topic connectivity
test_topic() {
    local topic_name=$1
    echo "🧪 Testing topic: $topic_name"
    
    if command -v docker >/dev/null 2>&1; then
        echo "Sending test message to topic..."
        echo "Test message $(date)" | docker exec -i kafka kafka-console-producer \
            --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
            --topic "$topic_name"
        
        echo "Reading messages from topic (timeout 5s)..."
        timeout 5s docker exec kafka kafka-console-consumer \
            --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
            --topic "$topic_name" \
            --from-beginning \
            --max-messages 1 || echo "No messages or timeout reached"
    else
        echo "  ⚠️ Docker not available for testing"
    fi
}

# Function to show topic statistics
show_topic_stats() {
    echo "📈 Topic Statistics:"
    if command -v docker >/dev/null 2>&1; then
        echo "Total topics:"
        docker exec kafka kafka-topics --list --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" | wc -l
        
        echo -e "\nTopic details:"
        docker exec kafka kafka-topics --list --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" | while read topic; do
            if [ ! -z "$topic" ]; then
                partitions=$(docker exec kafka kafka-topics --describe --topic "$topic" --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" | grep "PartitionCount" | awk '{print $2}' | cut -d: -f2)
                echo "  $topic: $partitions partitions"
            fi
        done
    else
        echo "  ⚠️ Docker not available"
    fi
}

# Function to show consumer groups
show_consumer_groups() {
    echo "👥 Consumer Groups:"
    if command -v docker >/dev/null 2>&1; then
        docker exec kafka kafka-consumer-groups --list --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER"
    else
        echo "  ⚠️ Docker not available"
    fi
}

# Main menu
case "${2:-menu}" in
    "create")
        create_all_topics
        ;;
    "list")
        list_topics
        ;;
    "describe")
        if [ -z "$3" ]; then
            echo "Usage: $0 [server_ip] describe <topic_name>"
            exit 1
        fi
        describe_topic "$3"
        ;;
    "delete")
        if [ -z "$3" ]; then
            echo "Usage: $0 [server_ip] delete <topic_name>"
            exit 1
        fi
        delete_topic "$3"
        ;;
    "test")
        if [ -z "$3" ]; then
            echo "Usage: $0 [server_ip] test <topic_name>"
            exit 1
        fi
        test_topic "$3"
        ;;
    "stats")
        show_topic_stats
        ;;
    "groups")
        show_consumer_groups
        ;;
    "menu"|*)
        echo "Available commands:"
        echo "  $0 [server_ip] create          - Create all system topics"
        echo "  $0 [server_ip] list            - List all topics"
        echo "  $0 [server_ip] describe <topic> - Describe a topic"
        echo "  $0 [server_ip] delete <topic>   - Delete a topic" 
        echo "  $0 [server_ip] test <topic>     - Test topic connectivity"
        echo "  $0 [server_ip] stats           - Show topic statistics"
        echo "  $0 [server_ip] groups          - Show consumer groups"
        echo ""
        echo "Examples:"
        echo "  $0 create"
        echo "  $0 34.123.45.67 list"
        echo "  $0 localhost test inventory-reservation-request"
        ;;
esac