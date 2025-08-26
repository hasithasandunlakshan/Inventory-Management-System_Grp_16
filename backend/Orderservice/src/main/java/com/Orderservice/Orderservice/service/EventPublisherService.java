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
            // Convert OrderItems to InventoryReservationItems
            List<InventoryReservationItem> items = orderItems.stream()
                .map(orderItem -> new InventoryReservationItem(
                    orderItem.getProductId(),
                    orderItem.getQuantity(),
                    orderItem.getBarcode() != null ? orderItem.getBarcode().toString() : null
                ))
                .collect(Collectors.toList());

            InventoryReservationRequestEvent event = new InventoryReservationRequestEvent(
                orderId, customerId, items);

            kafkaTemplate.send("inventory-reservation-request", event);
            
            log.info("Published inventory reservation request for order: {} with {} items", orderId, items.size());
            
        } catch (Exception e) {
            log.error("Failed to publish inventory reservation request for order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Failed to publish inventory reservation request", e);
        }
    }
}
