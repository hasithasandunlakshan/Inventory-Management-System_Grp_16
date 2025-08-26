package com.example.productservice.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.example.productservice.events.InventoryReservationRequestEvent;
import com.example.productservice.events.InventoryReservationResponseEvent;
import com.example.productservice.events.dto.InventoryReservationItem;
import com.example.productservice.models.Product;
import com.example.productservice.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final ProductRepository productRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public void processInventoryReservation(InventoryReservationRequestEvent event) {
        log.info("Processing inventory reservation for order: {}", event.getOrderId());
        
        List<String> failedItems = new ArrayList<>();
        boolean allItemsReserved = true;
        
        try {
            // Check availability for all items first
            for (InventoryReservationItem item : event.getItems()) {
                Product product = productRepository.findById(item.getProductId())
                    .orElse(null);
                
                if (product == null) {
                    failedItems.add("Product not found: " + item.getProductId());
                    allItemsReserved = false;
                    continue;
                }
                
                // Calculate current available stock
                int currentAvailableStock = product.getStock() - product.getReserved();
                
                if (currentAvailableStock < item.getQuantity()) {
                    failedItems.add("Insufficient stock for product: " + product.getName() + 
                        " (Available: " + currentAvailableStock + ", Requested: " + item.getQuantity() + ")");
                    allItemsReserved = false;
                }
            }
            
            // If all items are available, proceed with reservation
            if (allItemsReserved) {
                for (InventoryReservationItem item : event.getItems()) {
                    Product product = productRepository.findById(item.getProductId()).get();
                    
                    // Update reserved quantity
                    product.setReserved(product.getReserved() + item.getQuantity());
                    
                    // Update available stock (auto-calculated)
                    product.setAvailableStock(product.getStock() - product.getReserved());
                    
                    productRepository.save(product);
                    
                    log.info("Reserved {} units of product {} for order {}", 
                        item.getQuantity(), product.getName(), event.getOrderId());
                }
                
                // Send success response
                sendInventoryReservationResponse(event.getOrderId(), true, 
                    "Inventory reserved successfully", new ArrayList<>());
                
            } else {
                // Send failure response
                sendInventoryReservationResponse(event.getOrderId(), false, 
                    "Failed to reserve inventory", failedItems);
            }
            
        } catch (Exception e) {
            log.error("Error processing inventory reservation for order {}: {}", 
                event.getOrderId(), e.getMessage(), e);
            
            failedItems.add("System error: " + e.getMessage());
            sendInventoryReservationResponse(event.getOrderId(), false, 
                "System error during inventory reservation", failedItems);
        }
    }
    
    private void sendInventoryReservationResponse(Long orderId, boolean success, 
                                                String message, List<String> failedItems) {
        InventoryReservationResponseEvent response = new InventoryReservationResponseEvent(
            orderId, success, message, failedItems);
        
        kafkaTemplate.send("inventory-reservation-response", response);
        log.info("Sent inventory reservation response for order {}: {}", orderId, success);
    }
    
    @Transactional
    public void releaseInventoryReservation(Long orderId, List<InventoryReservationItem> items) {
        log.info("Releasing inventory reservation for order: {}", orderId);
        
        for (InventoryReservationItem item : items) {
            Product product = productRepository.findById(item.getProductId())
                .orElse(null);
            
            if (product != null) {
                // Release reserved quantity
                int newReserved = Math.max(0, product.getReserved() - item.getQuantity());
                product.setReserved(newReserved);
                
                // Update available stock
                product.setAvailableStock(product.getStock() - product.getReserved());
                
                productRepository.save(product);
                
                log.info("Released {} units of product {} for order {}", 
                    item.getQuantity(), product.getName(), orderId);
            }
        }
    }
}
