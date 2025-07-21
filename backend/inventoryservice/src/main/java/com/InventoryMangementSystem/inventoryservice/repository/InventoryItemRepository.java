package com.InventoryMangementSystem.inventoryservice.repository;


import com.InventoryMangementSystem.inventoryservice.models.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {}
