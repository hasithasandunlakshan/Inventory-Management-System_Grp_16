package com.Orderservice.Orderservice.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.Orderservice.Orderservice.events.InventoryReservationResponseEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventListener {

    @KafkaListener(topics = "inventory-reservation-response", groupId = "order-service-group")
    public void handleInventoryReservationResponse(
            @Payload InventoryReservationResponseEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("Received inventory reservation response for order: {} from topic: {}, partition: {}, offset: {}", 
                event.getOrderId(), topic, partition, offset);
            
            if (event.isSuccess()) {
                log.info("Inventory reservation successful for order: {}", event.getOrderId());
                // Here you could update order status, send notifications, etc.
            } else {
                log.warn("Inventory reservation failed for order: {}. Reason: {}", 
                    event.getOrderId(), event.getMessage());
                
                if (event.getFailedItems() != null && !event.getFailedItems().isEmpty()) {
                    log.warn("Failed items: {}", String.join(", ", event.getFailedItems()));
                }
                
                // Here you could handle the failure - cancel order, notify customer, etc.
            }
            
            // Acknowledge the message after successful processing
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing inventory reservation response for order {}: {}", 
                event.getOrderId(), e.getMessage(), e);
            
            // Acknowledge to prevent infinite retries
            acknowledgment.acknowledge();
        }
    }
}
