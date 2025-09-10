package com.InventoryMangementSystem.inventoryservice.controller;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getOrCreateByProductId(productId));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Inventory>> listAll() {
        return ResponseEntity.ok(inventoryService.listAll());
    }

    @PostMapping("/{productId}/adjust")
    public ResponseEntity<Inventory> adjust(@PathVariable Long productId, @RequestParam int delta) {
        return ResponseEntity.ok(inventoryService.adjustStock(productId, delta));
    }

    @PostMapping("/{productId}/reserve")
    public ResponseEntity<Inventory> reserve(@PathVariable Long productId, @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.reserveStock(productId, quantity));
    }

    @PostMapping("/{productId}/threshold")
    public ResponseEntity<Inventory> updateThreshold(@PathVariable Long productId, @RequestParam int value) {
        return ResponseEntity.ok(inventoryService.updateThreshold(productId, value));
    }
}
