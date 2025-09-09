package com.Orderservice.Orderservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.events.InventoryReservationRequestEvent;
import com.Orderservice.Orderservice.events.OrderNotificationEvent;
import com.Orderservice.Orderservice.events.dto.InventoryReservationItem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishInventoryReservationRequest(Long orderId, Long customerId, List<OrderItem> orderItems) {
        try {
            System.out.println("📤 PUBLISHING KAFKA EVENT: inventory-reservation-request");
            System.out.println("Order ID: " + orderId);
            System.out.println("Customer ID: " + customerId);
            System.out.println("Number of items: " + orderItems.size());
            
            // Convert OrderItems to InventoryReservationItems
            List<InventoryReservationItem> items = orderItems.stream()
                .map(orderItem -> {
                    String barcode = orderItem.getBarcode() != null ? orderItem.getBarcode().toString() : null;
                    System.out.println("Converting item - Product ID: " + orderItem.getProductId() + 
                                     ", Quantity: " + orderItem.getQuantity() + 
                                     ", Barcode: " + barcode);
                    return new InventoryReservationItem(
                        orderItem.getProductId(),
                        orderItem.getQuantity(),
                        barcode
                    );
                })
                .collect(Collectors.toList());

            InventoryReservationRequestEvent event = new InventoryReservationRequestEvent(
                orderId, customerId, items);

            System.out.println("Sending event to Kafka topic: inventory-reservation-request");
            kafkaTemplate.send("inventory-reservation-request", event);
            System.out.println("✅ Event sent successfully!");
            
            log.info("Published inventory reservation request for order: {} with {} items", orderId, items.size());
            
        } catch (Exception e) {
            System.err.println("❌ KAFKA PUBLISH FAILED:");
            System.err.println("Order ID: " + orderId);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            log.error("Failed to publish inventory reservation request for order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish inventory reservation request", e);
        }
    }
    
    /**
     * Publish order notification event to Kafka
     */
    public void publishOrderNotification(Long orderId, Long customerId, String status, Double totalAmount, String message) {
        try {
            System.out.println("🔔 PUBLISHING ORDER NOTIFICATION EVENT");
            System.out.println("Order ID: " + orderId);
            System.out.println("Customer ID: " + customerId);
            System.out.println("Status: " + status);
            System.out.println("Total Amount: $" + totalAmount);
            System.out.println("Message: " + message);
            
            // Create order notification event
            OrderNotificationEvent event = new OrderNotificationEvent(
                orderId, customerId, status, totalAmount, message
            );
            
            System.out.println("Sending notification event to Kafka topic: order-notifications");
            kafkaTemplate.send("order-notifications", event);
            System.out.println("✅ Order notification event sent successfully!");
            
            log.info("Published order notification for order: {} to customer: {}", orderId, customerId);
            
        } catch (Exception e) {
            System.err.println("❌ KAFKA ORDER NOTIFICATION PUBLISH FAILED:");
            System.err.println("Order ID: " + orderId);
            System.err.println("Customer ID: " + customerId);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            log.error("Failed to publish order notification for order {}: {}", orderId, e.getMessage(), e);
            // Don't throw exception here as notification failure shouldn't break order creation
        }
    }
    
    /**
     * Publish order notification event with custom event type
     */
    public void publishOrderNotification(String eventType, Long orderId, Long customerId, String status, Double totalAmount, String message) {
        try {
            System.out.println("🔔 PUBLISHING ORDER NOTIFICATION EVENT: " + eventType);
            System.out.println("Order ID: " + orderId);
            System.out.println("Customer ID: " + customerId);
            
            // Create order notification event with specific event type
            OrderNotificationEvent event = new OrderNotificationEvent(
                eventType, orderId, customerId, status, totalAmount, message
            );
            
            kafkaTemplate.send("order-notifications", event);
            System.out.println("✅ Order notification event (" + eventType + ") sent successfully!");
            
            log.info("Published {} notification for order: {} to customer: {}", eventType, orderId, customerId);
            
        } catch (Exception e) {
            log.error("Failed to publish {} notification for order {}: {}", eventType, orderId, e.getMessage(), e);
        }
    }
}
