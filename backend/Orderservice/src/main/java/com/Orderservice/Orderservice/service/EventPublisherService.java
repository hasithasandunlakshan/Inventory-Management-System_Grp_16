package com.Orderservice.Orderservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.events.InventoryReservationRequestEvent;
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
}
