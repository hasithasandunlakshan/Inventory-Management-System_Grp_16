# Notification Service

A real-time notification service built with Spring Boot, WebSocket, and Kafka integration.

## Features

- **WebSocket Support**: Real-time notifications to individual users
- **Kafka Integration**: Subscribes to Kafka topics for event-driven notifications
- **Database Storage**: Persists notifications with read/unread status
- **REST API**: Complete CRUD operations for notifications
- **User-specific Notifications**: Send notifications to specific users
- **Broadcast Notifications**: Send notifications to all connected users

## Architecture

```
Order Service → Kafka (order-notifications) → Notification Service → WebSocket → Frontend
```

## Setup Instructions

### Prerequisites

1. **Java 17+**
2. **MySQL Database**
3. **Kafka Running on port 9092**

### Database Setup

1. Create a MySQL database named `notification_db`
2. Update `application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/notification_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Kafka Setup

Ensure Kafka is running on `localhost:9092`. The service will automatically subscribe to these topics:
- `order-notifications`
- `inventory-notifications`
- `payment-notifications`

### Running the Service

1. **Build the project:**
   ```bash
   ./mvnw clean install
   ```

2. **Run the service:**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Service will start on port 8085**

## API Endpoints

### REST API

- `GET /api/health` - Health check
- `GET /api/notifications/user/{userId}` - Get all notifications for user
- `GET /api/notifications/user/{userId}/unread` - Get unread notifications
- `GET /api/notifications/user/{userId}/count` - Get unread count
- `PUT /api/notifications/{notificationId}/read` - Mark notification as read
- `PUT /api/notifications/user/{userId}/read-all` - Mark all as read
- `POST /api/notifications/test` - Send test notification
- `POST /api/notifications/broadcast` - Send broadcast notification

### WebSocket Endpoints

- **Connection**: `ws://localhost:8085/ws`
- **User Notifications**: `/user/queue/notifications`
- **Broadcast**: `/topic/notifications`

### WebSocket Commands

Send messages to these destinations:
- `/app/subscribe` - Subscribe to notifications
- `/app/history` - Get notification history
- `/app/mark-read` - Mark notification as read
- `/app/mark-all-read` - Mark all notifications as read
- `/app/ping` - Connection test

## Testing

### WebSocket Test Page

Visit `http://localhost:8085/websocket-test.html` for a complete WebSocket testing interface.

### REST API Testing

1. **Send a test notification:**
   ```bash
   curl -X POST http://localhost:8085/api/notifications/test \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123", "message": "Hello World!", "type": "TEST"}'
   ```

2. **Get user notifications:**
   ```bash
   curl http://localhost:8085/api/notifications/user/user123
   ```

3. **Send broadcast notification:**
   ```bash
   curl -X POST http://localhost:8085/api/notifications/broadcast \
     -H "Content-Type: application/json" \
     -d '{"message": "System maintenance in 10 minutes", "type": "SYSTEM"}'
   ```

## Kafka Event Examples

### Order Event Structure

When an order event is published to the `order-notifications` topic, it should have this structure:

```json
{
  "orderId": "ORDER-123",
  "userId": "user123",
  "eventType": "ORDER_PLACED",
  "orderStatus": "CONFIRMED",
  "totalAmount": 99.99,
  "timestamp": "2024-01-01T12:00:00",
  "customerName": "John Doe",
  "items": "Product A x2, Product B x1"
}
```

### Supported Event Types

- `ORDER_PLACED` - Order has been placed
- `ORDER_CONFIRMED` - Order confirmed and processing
- `ORDER_SHIPPED` - Order shipped
- `ORDER_DELIVERED` - Order delivered
- `ORDER_CANCELLED` - Order cancelled

## Frontend Integration

### JavaScript WebSocket Client

```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8085/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to personal notifications
    stompClient.subscribe('/user/queue/notifications', function (notification) {
        const notificationData = JSON.parse(notification.body);
        console.log('Received notification:', notificationData);
        // Handle notification in UI
    });
    
    // Send subscription message with user ID
    stompClient.send("/app/subscribe", {}, JSON.stringify({
        'userId': 'user123'
    }));
});
```

### React Integration Example

```jsx
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8085/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            setConnected(true);
            
            stompClient.subscribe('/user/queue/notifications', (notification) => {
                const notificationData = JSON.parse(notification.body);
                setNotifications(prev => [notificationData, ...prev]);
            });

            stompClient.send("/app/subscribe", {}, JSON.stringify({ userId }));
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
                setConnected(false);
            }
        };
    }, [userId]);

    return { notifications, connected };
}
```

## Configuration

### Application Properties

```properties
# Server Configuration
server.port=8085

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=notification-service-group
spring.kafka.consumer.auto-offset-reset=earliest

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/notification_db
spring.datasource.username=root
spring.datasource.password=password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Monitoring and Logging

The service includes comprehensive logging:
- Kafka message processing
- WebSocket connections
- Notification delivery
- Error handling

Logs are available in the console output and can be configured in `application.properties`.

## Production Considerations

1. **Security**: Configure CORS properly and add authentication
2. **Database**: Use connection pooling and optimize queries
3. **Kafka**: Configure proper error handling and dead letter queues
4. **Scaling**: Use Redis for session storage in multi-instance deployments
5. **Monitoring**: Add health checks and metrics collection

## Troubleshooting

### Common Issues

1. **Kafka Connection Failed**: Ensure Kafka is running on port 9092
2. **Database Connection Failed**: Check MySQL connection and credentials
3. **WebSocket Connection Failed**: Verify CORS configuration
4. **Notifications Not Received**: Check user ID matching and subscription

### Debug Mode

Enable debug logging:
```properties
logging.level.com.notificationservice=DEBUG
logging.level.org.springframework.kafka=DEBUG
```
