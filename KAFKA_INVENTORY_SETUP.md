# Kafka-Based Inventory Management System

## Overview

This implementation adds real-time inventory management using Apache Kafka for inter-service communication. When an order is created, it automatically reserves inventory and updates available stock.

## Architecture

### Components:
1. **Order Service**: Publishes inventory reservation requests when orders are confirmed
2. **Product Service**: Listens to reservation requests and updates inventory
3. **Kafka**: Event streaming platform for reliable inter-service communication

### Database Changes:
- **Product Table**: Added `reserved` and `available_stock` columns
- **Logic**: `available_stock = physical_stock - reserved`

## Setup Instructions

### Option 1: Local Kafka Setup (Recommended for Development)

#### A. Using Docker Compose (Easiest)

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: true

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    depends_on:
      - kafka
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
```

**Start Kafka:**
```bash
docker-compose up -d
```

**Configuration for Local Kafka:**

**Product Service** (`application.properties`):
```properties
# Local Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=product-service-group
```

**Order Service** (`application.properties`):
```properties
# Local Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=order-service-group
```

#### B. Manual Kafka Installation

1. **Download Kafka:**
   ```bash
   # Download Kafka 2.8.0
   wget https://downloads.apache.org/kafka/2.8.0/kafka_2.13-2.8.0.tgz
   tar -xzf kafka_2.13-2.8.0.tgz
   cd kafka_2.13-2.8.0
   ```

2. **Start Zookeeper:**
   ```bash
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```

3. **Start Kafka Server:**
   ```bash
   bin/kafka-server-start.sh config/server.properties
   ```

4. **Create Topics:**
   ```bash
   bin/kafka-topics.sh --create --topic inventory-reservation-request --bootstrap-server localhost:9092
   bin/kafka-topics.sh --create --topic inventory-reservation-response --bootstrap-server localhost:9092
   ```

### Option 2: Confluent Cloud Setup (Production)

1. Create a Confluent Cloud account
2. Create a new cluster
3. Create the following topics:
   - `inventory-reservation-request`
   - `inventory-reservation-response`
4. Generate API credentials (API Key and Secret)

**Configuration for Confluent Cloud:**

**Product Service** (`application.properties`):
```properties
spring.kafka.bootstrap-servers=<YOUR_CONFLUENT_CLOUD_BOOTSTRAP_SERVERS>
spring.kafka.properties.security.protocol=SASL_SSL
spring.kafka.properties.sasl.mechanism=PLAIN
spring.kafka.properties.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="<YOUR_API_KEY>" password="<YOUR_API_SECRET>";
spring.kafka.consumer.group-id=product-service-group
```

**Order Service** (`application.properties`):
```properties
spring.kafka.bootstrap-servers=<YOUR_CONFLUENT_CLOUD_BOOTSTRAP_SERVERS>
spring.kafka.properties.security.protocol=SASL_SSL
spring.kafka.properties.sasl.mechanism=PLAIN
spring.kafka.properties.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="<YOUR_API_KEY>" password="<YOUR_API_SECRET>";
spring.kafka.consumer.group-id=order-service-group
```

### 3. Database Migration

Run the following SQL to update your existing product table:

```sql
-- Add new columns for inventory management
ALTER TABLE products 
ADD COLUMN reserved INT DEFAULT 0,
ADD COLUMN available_stock INT;

-- Update available_stock for existing products
UPDATE products SET available_stock = stock WHERE available_stock IS NULL;

-- Optional: Rename stock column to physical_stock for clarity
-- Note: Our code already maps Java field 'stock' to database column 'physical_stock'
-- So this rename is optional - you can keep the existing 'stock' column name
-- ALTER TABLE products CHANGE COLUMN stock physical_stock INT;
```

**Important Note:** Our Java code uses `@Column(name = "physical_stock")` mapping, which means:
- If you rename the database column to `physical_stock`, everything works perfectly
- If you keep the existing `stock` column name, just change the mapping to `@Column(name = "stock")`

### 4. Build and Run

**Prerequisites:**
- Java 17 or higher
- Maven 3.6 or higher
- MySQL database running
- Docker Desktop installed and running

#### Step-by-Step Startup Process:

**Step 1: Start Docker Desktop**
- On Windows: Open Docker Desktop from Start Menu
- Wait for Docker to fully start (green icon in system tray)
- Verify Docker is running by opening Command Prompt/PowerShell and run:
  ```powershell
  docker --version
  docker-compose --version
  ```

**Step 2: Start Kafka with Docker Compose**
```bash
# Navigate to your project root directory
cd "C:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16"

# Start Kafka containers (this will download images first time)
docker-compose up -d

# Check if containers are running
docker ps
```

**Step 3: Wait for Kafka to be Ready**
```bash
# Wait about 30 seconds for Kafka to fully start, then check logs
docker logs kafka

# You should see "started (kafka.server.KafkaServer)" in the logs
```

**Step 4: Create Kafka Topics**

**Option A: Automatic Creation (Recommended)**
```bash
# Topics will be created automatically when services start publishing/consuming
# This is enabled by KAFKA_AUTO_CREATE_TOPICS_ENABLE=true in docker-compose.yml
```

**Option B: Manual Creation**
```bash
# Create inventory reservation request topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic inventory-reservation-request --partitions 3 --replication-factor 1

# Create inventory reservation response topic  
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic inventory-reservation-response --partitions 3 --replication-factor 1

# List all topics to verify creation
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

**Step 5: Verify Kafka Setup**
```bash
# Access Kafka UI in your browser
# Open: http://localhost:8080
# You should see your Kafka cluster and topics
```

**Step 6: Build and Start Services**

**Terminal 1 - Product Service:**
```bash
cd backend/productservice
./mvnw clean install
./mvnw spring-boot:run
```

**Terminal 2 - Order Service:**
```bash
cd backend/Orderservice  
./mvnw clean install
./mvnw spring-boot:run
```

#### Windows PowerShell Commands:
```powershell
# If using PowerShell on Windows, use these commands:

# Start Kafka
docker-compose up -d

# Create topics manually (if needed)
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic inventory-reservation-request --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic inventory-reservation-response --partitions 3 --replication-factor 1

# Check topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check container status
docker ps

# View logs
docker logs kafka
docker logs zookeeper

# Stop everything when done
docker-compose down
```

### 5. Verify Setup

**Step 1: Check Docker Containers**
```bash
# List running containers
docker ps

# You should see 3 containers:
# - kafka
# - zookeeper  
# - kafka-ui
```

**Step 2: Check Kafka Topics**
```bash
# List all topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Expected output:
# inventory-reservation-request
# inventory-reservation-response
```

**Step 3: Access Kafka UI**
- Open http://localhost:8080 in your browser
- Navigate to "Topics" section
- You should see your topics listed with message counts

**Step 4: Test Topic Creation (Optional)**
```bash
# Send a test message
docker exec kafka kafka-console-producer --bootstrap-server localhost:9092 --topic inventory-reservation-request
# Type: {"test": "message"} and press Enter, then Ctrl+C to exit

# Read the message
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic inventory-reservation-request --from-beginning
# You should see your test message, then Ctrl+C to exit
```

**Step 5: Test the Complete Flow**
1. Create a product with stock = 10 using Product Service API
2. Create an order with quantity = 3 using Order Service API  
3. Check the database:
   - `reserved` should be 3
   - `available_stock` should be 7
4. Check Kafka UI for message activity

#### Service Health Check URLs:
- **Product Service**: http://localhost:8083/api/products
- **Order Service**: http://localhost:8084 (check logs for confirmation)
- **Kafka UI**: http://localhost:8080
- **Database**: Your MySQL connection

#### Troubleshooting:

**If Docker containers won't start:**
```bash
# Stop all containers
docker-compose down

# Remove old containers and networks
docker system prune

# Restart Docker Desktop and try again
docker-compose up -d
```

**If topics aren't created:**
```bash
# Check Kafka logs
docker logs kafka

# Manually create topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic inventory-reservation-request --partitions 3 --replication-factor 1
```

**If services can't connect to Kafka:**
```bash
# Check if Kafka is accessible
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check service logs for connection errors
# Update application.properties if needed
```

## How It Works

### Order Flow:
1. Customer creates an order
2. Payment is processed and confirmed
3. Order status changes to `CONFIRMED`
4. **NEW**: Kafka event `InventoryReservationRequestEvent` is published
5. Product Service receives the event
6. Product Service updates `reserved` quantity for each item
7. Product Service auto-calculates `available_stock = physical_stock - reserved`
8. Product Service sends back a response event

### Event Structure:

**InventoryReservationRequestEvent**:
```json
{
  "eventId": "uuid",
  "eventType": "INVENTORY_RESERVATION_REQUEST",
  "timestamp": "2025-08-26T10:00:00",
  "version": "1.0",
  "source": "order-service",
  "orderId": 123,
  "customerId": 456,
  "items": [
    {
      "productId": 789,
      "quantity": 2,
      "barcode": "PRD-001"
    }
  ]
}
```

## New API Endpoints

### Product Service:
- `PUT /api/products/{id}/stock` - Update physical stock
- `GET /api/products/available` - Get products with available stock > 0
- `GET /api/products/category/{categoryId}/available` - Get available products by category

### Frontend Integration:
- Use `/available` endpoints to show only items with stock
- Display `availableStock` instead of `stock` to customers
- `reserved` quantity is for internal use only

## Future Enhancements

This architecture supports easy addition of:
- Order cancellation (releases reserved inventory)
- Low stock notifications
- Supplier auto-ordering
- Analytics events
- User notifications
- Audit logging

## Monitoring

### Local Kafka (Docker):
- **Kafka UI**: http://localhost:8080
- Monitor topics, messages, and consumer groups
- View message content and troubleshoot issues

### Confluent Cloud:
Monitor Kafka topics in Confluent Cloud dashboard to track:
- Event throughput
- Failed messages
- Consumer lag
- Processing errors

### Application Logs:
Check your Spring Boot application logs for:
- Kafka connection status
- Event publishing/consuming
- Inventory reservation processing

## Error Handling

- **Payment succeeds but inventory fails**: Order remains confirmed, manual inventory adjustment needed
- **Kafka unavailable**: Payment still processes, inventory events queued for retry
- **Insufficient stock**: Inventory reservation fails, order status can be updated accordingly

## Testing

1. Create a product with stock = 10
2. Create an order with quantity = 3
3. Verify:
   - `reserved` = 3
   - `available_stock` = 7
   - Kafka events in Confluent Cloud dashboard
