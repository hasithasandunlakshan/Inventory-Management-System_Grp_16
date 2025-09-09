package com.notificationservice.notificationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notificationservice.notificationservice.dto.OrderEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Listen to order-notifications topic for order events
     */
    @KafkaListener(topics = "order-notifications", groupId = "notification-service-group")
    public void handleOrderEvent(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        try {
            logger.info("Received message from topic {}, partition {}, offset {}: {}", topic, partition, offset, message);
            
            // Parse the JSON message to OrderEventDto
            OrderEventDto orderEvent = objectMapper.readValue(message, OrderEventDto.class);
            
            // Process the order event and create notification
            processOrderEvent(orderEvent);
            
        } catch (Exception e) {
            logger.error("Error processing order event from Kafka: {}", e.getMessage(), e);
            // In production, you might want to send to a dead letter queue
        }
    }
    
    /**
     * Listen to inventory-notifications topic for inventory events
     */
    @KafkaListener(topics = "inventory-notifications", groupId = "notification-service-group")
    public void handleInventoryEvent(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        
        try {
            logger.info("Received inventory event from topic {}: {}", topic, message);
            
            // For now, we'll handle this as a simple JSON object
            // You can create a specific DTO for inventory events later
            processInventoryEvent(message);
            
        } catch (Exception e) {
            logger.error("Error processing inventory event from Kafka: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Listen to payment-notifications topic for payment events
     */
    @KafkaListener(topics = "payment-notifications", groupId = "notification-service-group")
    public void handlePaymentEvent(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        
        try {
            logger.info("Received payment event from topic {}: {}", topic, message);
            
            processPaymentEvent(message);
            
        } catch (Exception e) {
            logger.error("Error processing payment event from Kafka: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Process order events and send appropriate notifications
     */
    private void processOrderEvent(OrderEventDto orderEvent) {
        String notificationMessage;
        String notificationType = "ORDER";
        
        // Use the message from the order event if available, otherwise create custom message
        if (orderEvent.getMessage() != null && !orderEvent.getMessage().isEmpty()) {
            notificationMessage = orderEvent.getMessage();
        } else {
            // Create custom messages based on event type
            switch (orderEvent.getEventType().toUpperCase()) {
                case "ORDER_CREATED":
                    notificationMessage = String.format(
                        "Your order #%d has been placed successfully! Total amount: $%.2f. Status: %s", 
                        orderEvent.getOrderId(), 
                        orderEvent.getTotalAmount(),
                        orderEvent.getStatus()
                    );
                    break;
                    
                case "ORDER_CONFIRMED":
                    notificationMessage = String.format(
                        "Your order #%d has been confirmed and is being processed.", 
                        orderEvent.getOrderId()
                    );
                    break;
                    
                case "ORDER_SHIPPED":
                    notificationMessage = String.format(
                        "Great news! Your order #%d has been shipped and is on its way.", 
                        orderEvent.getOrderId()
                    );
                    break;
                    
                case "ORDER_DELIVERED":
                    notificationMessage = String.format(
                        "Your order #%d has been delivered successfully! Thank you for your purchase.", 
                        orderEvent.getOrderId()
                    );
                    break;
                    
                case "ORDER_CANCELLED":
                    notificationMessage = String.format(
                        "Your order #%d has been cancelled. If you have any questions, please contact support.", 
                        orderEvent.getOrderId()
                    );
                    break;
                    
                case "ORDER_STATUS_UPDATED":
                    // Use the message from the event (which contains the detailed status message)
                    notificationMessage = orderEvent.getMessage() != null && !orderEvent.getMessage().isEmpty() 
                        ? orderEvent.getMessage()
                        : String.format("Your order #%d status has been updated.", orderEvent.getOrderId());
                    break;
                    
                default:
                    notificationMessage = String.format(
                        "Update on your order #%d: %s", 
                        orderEvent.getOrderId(), 
                        orderEvent.getEventType()
                    );
            }
        }
        
        // Create metadata with additional order information
        String metadata = String.format(
            "{\"orderId\":%d,\"eventType\":\"%s\",\"totalAmount\":%.2f,\"status\":\"%s\",\"timestamp\":\"%s\"}", 
            orderEvent.getOrderId(),
            orderEvent.getEventType(),
            orderEvent.getTotalAmount(),
            orderEvent.getStatus(),
            orderEvent.getTimestamp()
        );
        
        // Send notification to the specific user (using customerId as String)
        notificationService.createAndSendNotification(
            String.valueOf(orderEvent.getCustomerId()), 
            notificationMessage, 
            notificationType, 
            metadata
        );
        
        logger.info("Order notification sent to user {}: {}", orderEvent.getCustomerId(), notificationMessage);
    }
    
    /**
     * Process inventory events (placeholder implementation)
     */
    private void processInventoryEvent(String inventoryEventMessage) {
        // Parse and process inventory events
        // This is a placeholder - implement based on your inventory event structure
        logger.info("Processing inventory event: {}", inventoryEventMessage);
        
        // Example: Send broadcast notification for low stock
        notificationService.sendBroadcastNotification(
            "Inventory update received", 
            "INVENTORY"
        );
    }
    
    /**
     * Process payment events (placeholder implementation)
     */
    private void processPaymentEvent(String paymentEventMessage) {
        // Parse and process payment events
        // This is a placeholder - implement based on your payment event structure
        logger.info("Processing payment event: {}", paymentEventMessage);
        
        // Example implementation would parse the payment event and send notifications
    }
}
