package com.example.productservice.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import com.example.productservice.events.InventoryReservationRequestEvent;
import com.example.productservice.service.InventoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventListener {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "inventory-reservation-request", groupId = "product-service-group")
    public void handleInventoryReservationRequest(
            @Payload InventoryReservationRequestEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("Received inventory reservation request for order: {} from topic: {}, partition: {}, offset: {}", 
                event.getOrderId(), topic, partition, offset);
            
            inventoryService.processInventoryReservation(event);
            
            // Acknowledge the message after successful processing
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing inventory reservation request for order {}: {}", 
                event.getOrderId(), e.getMessage(), e);
            
            // In a production environment, you might want to implement retry logic or dead letter queue
            // For now, we'll acknowledge to prevent infinite retries
            acknowledgment.acknowledge();
        }
    }
}
