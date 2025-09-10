package com.InventoryMangementSystem.inventoryservice.services;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.models.StockAlert;
import com.InventoryMangementSystem.inventoryservice.repository.InventoryRepository;
import com.InventoryMangementSystem.inventoryservice.repository.StockAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockAlertRepository stockAlertRepository;

    public InventoryService(InventoryRepository inventoryRepository, StockAlertRepository stockAlertRepository) {
        this.inventoryRepository = inventoryRepository;
        this.stockAlertRepository = stockAlertRepository;
    }

    public Inventory getOrCreateByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .productId(productId)
                        .stock(0)
                        .reserved(0)
                        .availableStock(0)
                        .build()));
    }

    @Transactional
    public Inventory adjustStock(Long productId, int delta) {
        Inventory inventory = getOrCreateByProductId(productId);
        int newStock = inventory.getStock() + delta;
        inventory.setStock(newStock);
        int available = newStock - inventory.getReserved();
        inventory.setAvailableStock(Math.max(available, 0));
        Inventory saved = inventoryRepository.save(inventory);
        maybeCreateAlert(saved);
        return saved;
    }

    @Transactional
    public Inventory reserveStock(Long productId, int quantity) {
        Inventory inventory = getOrCreateByProductId(productId);
        int newReserved = Math.max(inventory.getReserved() + quantity, 0);
        inventory.setReserved(newReserved);
        int available = inventory.getStock() - newReserved;
        inventory.setAvailableStock(Math.max(available, 0));
        Inventory saved = inventoryRepository.save(inventory);
        maybeCreateAlert(saved);
        return saved;
    }

    public void resolveAlert(Long alertId) {
        stockAlertRepository.findById(alertId).ifPresent(alert -> {
            alert.setResolved(true);
            stockAlertRepository.save(alert);
        });
    }

    private void maybeCreateAlert(Inventory inventory) {
        String alertType = null;
        String message = null;
        if (inventory.getAvailableStock() <= 0) {
            alertType = "OUT_OF_STOCK";
            message = "Product " + inventory.getProductId() + " is out of stock.";
        } else if (inventory.getAvailableStock() <= inventory.getMinThreshold()) {
            alertType = "LOW_STOCK";
            message = "Product " + inventory.getProductId() + " is low on stock (" + inventory.getAvailableStock()
                    + ")";
        }

        if (alertType != null) {
            // Cooldown: skip creating identical alert if one exists recently or unresolved
            StockAlert latest = stockAlertRepository
                    .findTopByProductIdAndAlertTypeOrderByCreatedAtDesc(inventory.getProductId(), alertType);
            if (latest != null) {
                java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusHours(1);
                if (!latest.isResolved() || (latest.getCreatedAt() != null && latest.getCreatedAt().isAfter(cutoff))) {
                    return;
                }
            }

            StockAlert alert = StockAlert.builder()
                    .productId(inventory.getProductId())
                    .alertType(alertType)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .isResolved(false)
                    .build();
            stockAlertRepository.save(alert);
        }
    }

    @Transactional
    public void scanAndCreateAlerts() {
        inventoryRepository.findAll().forEach(this::maybeCreateAlert);
    }
}
