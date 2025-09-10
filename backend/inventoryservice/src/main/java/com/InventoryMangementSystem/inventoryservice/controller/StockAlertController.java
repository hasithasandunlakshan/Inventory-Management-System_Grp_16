package com.InventoryMangementSystem.inventoryservice.controller;

import com.InventoryMangementSystem.inventoryservice.models.StockAlert;
import com.InventoryMangementSystem.inventoryservice.repository.StockAlertRepository;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-alerts")
public class StockAlertController {

    private final StockAlertRepository stockAlertRepository;
    private final InventoryService inventoryService;

    public StockAlertController(StockAlertRepository stockAlertRepository, InventoryService inventoryService) {
        this.stockAlertRepository = stockAlertRepository;
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<StockAlert>> listOpenAlerts() {
        return ResponseEntity.ok(stockAlertRepository.findByIsResolvedFalse());
    }

    @GetMapping("/history")
    public ResponseEntity<List<StockAlert>> listAllHistory() {
        return ResponseEntity.ok(stockAlertRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockAlert>> listByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockAlertRepository.findByProductId(productId));
    }

    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<Void> resolve(@PathVariable Long alertId) {
        inventoryService.resolveAlert(alertId);
        return ResponseEntity.noContent().build();
    }
}
