package com.InventoryMangementSystem.inventoryservice.repository;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for testing
 */
@Repository
public interface TestInventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
}
