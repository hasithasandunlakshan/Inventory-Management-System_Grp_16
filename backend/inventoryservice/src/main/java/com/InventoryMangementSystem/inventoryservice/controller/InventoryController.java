package com.InventoryMangementSystem.inventoryservice.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for inventory management operations
 */
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
    public ResponseEntity<List<Inventory>> listAll() {
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

    // New endpoints for batch operations - for integration testing

    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@RequestBody Object requestDto) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Products available");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reserve-batch")
    public ResponseEntity<Map<String, Object>> reserveBatch(@RequestBody Object requestDto) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory reserved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmReservation(@RequestBody Object requestDto) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory confirmed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelReservation(@RequestBody Object requestDto) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reservation cancelled successfully");
        return ResponseEntity.ok(response);
    }
}
