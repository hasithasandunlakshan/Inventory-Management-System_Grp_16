# Order Service Integration Example

This document shows how to integrate the Order service with the Notification service via Kafka.

## Order Service Configuration

### 1. Add Kafka Producer Dependencies (if not already present)

Add to your Order service `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

### 2. Kafka Producer Configuration

Add to `application.properties`:

```properties
# Kafka Producer Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
```

### 3. Kafka Producer Service

Create a service to publish order events:

```java
package com.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationPublisher.class);
    private static final String ORDER_TOPIC = "order-notifications";
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public void publishOrderEvent(String orderId, String userId, String eventType, 
                                 Double totalAmount, String customerName) {
        try {
            Map<String, Object> orderEvent = new HashMap<>();
            orderEvent.put("orderId", orderId);
            orderEvent.put("userId", userId);
            orderEvent.put("eventType", eventType);
            orderEvent.put("totalAmount", totalAmount);
            orderEvent.put("timestamp", LocalDateTime.now().toString());
            orderEvent.put("customerName", customerName);
            
            String message = objectMapper.writeValueAsString(orderEvent);
            
            kafkaTemplate.send(ORDER_TOPIC, orderId, message);
            logger.info("Published order event: {} for order: {}", eventType, orderId);
            
        } catch (Exception e) {
            logger.error("Error publishing order event for order {}: {}", orderId, e.getMessage());
        }
    }
    
    // Convenience methods for specific events
    public void publishOrderPlaced(String orderId, String userId, Double totalAmount, String customerName) {
        publishOrderEvent(orderId, userId, "ORDER_PLACED", totalAmount, customerName);
    }
    
    public void publishOrderConfirmed(String orderId, String userId, Double totalAmount, String customerName) {
        publishOrderEvent(orderId, userId, "ORDER_CONFIRMED", totalAmount, customerName);
    }
    
    public void publishOrderShipped(String orderId, String userId, Double totalAmount, String customerName) {
        publishOrderEvent(orderId, userId, "ORDER_SHIPPED", totalAmount, customerName);
    }
    
    public void publishOrderDelivered(String orderId, String userId, Double totalAmount, String customerName) {
        publishOrderEvent(orderId, userId, "ORDER_DELIVERED", totalAmount, customerName);
    }
    
    public void publishOrderCancelled(String orderId, String userId, Double totalAmount, String customerName) {
        publishOrderEvent(orderId, userId, "ORDER_CANCELLED", totalAmount, customerName);
    }
}
```

### 4. Order Service Implementation

Update your Order service to publish events:

```java
package com.orderservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    
    @Autowired
    private NotificationPublisher notificationPublisher;
    
    // Your existing order repository and other dependencies
    
    public Order createOrder(OrderRequest orderRequest) {
        // Your existing order creation logic
        Order order = new Order();
        // ... set order properties
        
        // Save order to database
        Order savedOrder = orderRepository.save(order);
        
        // Publish notification event
        notificationPublisher.publishOrderPlaced(
            savedOrder.getId().toString(),
            savedOrder.getUserId(),
            savedOrder.getTotalAmount(),
            savedOrder.getCustomerName()
        );
        
        return savedOrder;
    }
    
    public Order confirmOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("CONFIRMED");
        Order updatedOrder = orderRepository.save(order);
        
        // Publish confirmation event
        notificationPublisher.publishOrderConfirmed(
            orderId,
            order.getUserId(),
            order.getTotalAmount(),
            order.getCustomerName()
        );
        
        return updatedOrder;
    }
    
    // Similar methods for ship, deliver, cancel operations
}
```

## Testing the Integration

### 1. Start Required Services

```bash
# Start Kafka (if using Docker)
cd "C:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16"
docker-compose up -d

# Or start Kafka manually
start-kafka.bat

# Start Notification Service
cd backend\notificationservice
./mvnw.cmd spring-boot:run

# Start Order Service
cd backend\orderservice
./mvnw.cmd spring-boot:run
```

### 2. Test Order Creation

Create a test order via Order service REST API:

```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "customerName": "John Doe",
    "items": [
      {"productId": "1", "quantity": 2, "price": 25.99},
      {"productId": "2", "quantity": 1, "price": 47.99}
    ],
    "totalAmount": 99.97
  }'
```

### 3. Monitor Notifications

1. **Open WebSocket Test Page**: `http://localhost:8085/websocket-test.html`
2. **Connect with User ID**: `user123`
3. **Create the test order** (step 2)
4. **You should see the notification appear in real-time**

### 4. Check Kafka Topics

```bash
# List Kafka topics
kafka-topics.bat --bootstrap-server localhost:9092 --list

# Monitor order-notifications topic
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic order-notifications --from-beginning
```

## Complete Flow Example

1. **User places order** → Order Service
2. **Order Service saves order** → Database
3. **Order Service publishes event** → Kafka (`order-notifications` topic)
4. **Notification Service receives event** → Kafka Consumer
5. **Notification Service processes event** → Creates notification
6. **Notification Service saves notification** → Database
7. **Notification Service sends notification** → WebSocket (to specific user)
8. **Frontend receives notification** → Real-time update

## Advanced Scenarios

### 1. Order Status Updates

When an order status changes, publish the appropriate event:

```java
public void updateOrderStatus(String orderId, String newStatus) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.setStatus(newStatus);
    orderRepository.save(order);
    
    switch (newStatus.toUpperCase()) {
        case "CONFIRMED":
            notificationPublisher.publishOrderConfirmed(orderId, order.getUserId(), 
                order.getTotalAmount(), order.getCustomerName());
            break;
        case "SHIPPED":
            notificationPublisher.publishOrderShipped(orderId, order.getUserId(), 
                order.getTotalAmount(), order.getCustomerName());
            break;
        case "DELIVERED":
            notificationPublisher.publishOrderDelivered(orderId, order.getUserId(), 
                order.getTotalAmount(), order.getCustomerName());
            break;
        case "CANCELLED":
            notificationPublisher.publishOrderCancelled(orderId, order.getUserId(), 
                order.getTotalAmount(), order.getCustomerName());
            break;
    }
}
```

### 2. Batch Order Processing

For multiple orders, publish events efficiently:

```java
public void processBatchOrders(List<Order> orders) {
    for (Order order : orders) {
        // Process order
        processOrder(order);
        
        // Publish notification
        notificationPublisher.publishOrderConfirmed(
            order.getId().toString(),
            order.getUserId(),
            order.getTotalAmount(),
            order.getCustomerName()
        );
    }
}
```

### 3. Error Handling

Add proper error handling for failed notifications:

```java
@EventListener
public void handleOrderCreationFailed(OrderCreationFailedEvent event) {
    // Send error notification to user
    notificationPublisher.publishOrderEvent(
        event.getOrderId(),
        event.getUserId(),
        "ORDER_FAILED",
        0.0,
        event.getCustomerName()
    );
}
```

This integration ensures that users receive real-time notifications for all order-related activities in your inventory management system.
