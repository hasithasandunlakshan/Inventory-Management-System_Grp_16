package com.InventoryMangementSystem.inventoryservice.controller;


import com.InventoryMangementSystem.inventoryservice.dto.InventoryItemDTO;
import com.InventoryMangementSystem.inventoryservice.models.InventoryItem;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItemDTO dto) {
        System.out.println("hi");
        System.out.println(dto);
        InventoryItem created = service.createItem(dto);
        return ResponseEntity.ok(created);
    }
}
