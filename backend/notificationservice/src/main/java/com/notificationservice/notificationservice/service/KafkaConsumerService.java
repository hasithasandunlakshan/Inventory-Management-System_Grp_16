package com.notificationservice.notificationservice.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notificationservice.notificationservice.dto.OrderEventDto;

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
        try {
            // Parse the inventory event JSON
            logger.info("Processing inventory event: {}", inventoryEventMessage);
            
            // Parse the message to extract user-specific information
            Map<String, Object> inventoryData = objectMapper.readValue(inventoryEventMessage, Map.class);
            
            // Extract the target userId (e.g., storekeeper, admin)
            // This should be part of your inventory event message
            String targetUserId = inventoryData.get("userId") != null 
                ? inventoryData.get("userId").toString() 
                : null;
            
            String eventType = inventoryData.get("eventType") != null 
                ? inventoryData.get("eventType").toString() 
                : "INVENTORY_UPDATE";
            
            String message = inventoryData.get("message") != null 
                ? inventoryData.get("message").toString() 
                : "Inventory update received";
            
            // Only send to specific user if userId is provided
            if (targetUserId != null && !targetUserId.isEmpty()) {
                notificationService.createAndSendNotification(
                    targetUserId,
                    message,
                    "INVENTORY",
                    inventoryEventMessage
                );
                logger.info("Inventory notification sent to user: {}", targetUserId);
            } else {
                logger.warn("Inventory event does not contain userId. Event: {}", inventoryEventMessage);
                // If no userId, this might be a system-wide notification
                // Only use broadcast for true system announcements
                // notificationService.sendBroadcastNotification(message, "INVENTORY");
            }
            
        } catch (Exception e) {
            logger.error("Error processing inventory event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Process payment events (placeholder implementation)
     */
    private void processPaymentEvent(String paymentEventMessage) {
        try {
            // Parse the payment event JSON
            logger.info("Processing payment event: {}", paymentEventMessage);
            
            // Parse the message to extract user-specific information
            Map<String, Object> paymentData = objectMapper.readValue(paymentEventMessage, Map.class);
            
            // Extract the userId who made the payment
            String userId = paymentData.get("userId") != null 
                ? paymentData.get("userId").toString() 
                : null;
            
            String eventType = paymentData.get("eventType") != null 
                ? paymentData.get("eventType").toString() 
                : "PAYMENT_UPDATE";
            
            String message = paymentData.get("message") != null 
                ? paymentData.get("message").toString() 
                : "Payment status updated";
            
            // Send notification only to the user who made the payment
            if (userId != null && !userId.isEmpty()) {
                notificationService.createAndSendNotification(
                    userId,
                    message,
                    "PAYMENT",
                    paymentEventMessage
                );
                logger.info("Payment notification sent to user: {}", userId);
            } else {
                logger.warn("Payment event does not contain userId. Event: {}", paymentEventMessage);
            }
            
        } catch (Exception e) {
            logger.error("Error processing payment event: {}", e.getMessage(), e);
        }
    }
}
