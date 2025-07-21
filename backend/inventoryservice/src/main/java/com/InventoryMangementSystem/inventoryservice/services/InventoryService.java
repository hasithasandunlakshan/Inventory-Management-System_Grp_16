package com.InventoryMangementSystem.inventoryservice.services;


import com.InventoryMangementSystem.inventoryservice.dto.InventoryItemDTO;
import com.InventoryMangementSystem.inventoryservice.models.InventoryItem;
import com.InventoryMangementSystem.inventoryservice.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final InventoryItemRepository repository;

    public InventoryService(InventoryItemRepository repository) {
        this.repository = repository;
    }

    public InventoryItem createItem(InventoryItemDTO dto) {
        InventoryItem item = InventoryItem.builder()
                .name(dto.getName())
                .categoryId(dto.getCategoryId())
                .quantity(dto.getQuantity())
                .reorderLevel(dto.getReorderLevel())
                .build();
        return repository.save(item);
    }
}
