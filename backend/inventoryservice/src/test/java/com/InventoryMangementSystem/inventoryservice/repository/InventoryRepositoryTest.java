package com.InventoryMangementSystem.inventoryservice.repository;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class InventoryRepositoryTest {

    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Test
    public void testSaveAndRetrieveInventory() {
        // Create test inventory
        Inventory inventory = Inventory.builder()
            .productId(101L)
            .stock(100)
            .reserved(10)
            .availableStock(90)
            .minThreshold(20)
            .build();
            
        // Save to repository
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Verify saved entity
        assertNotNull(savedInventory.getInventoryId());
        assertEquals(101L, savedInventory.getProductId());
        assertEquals(100, savedInventory.getStock());
        assertEquals(10, savedInventory.getReserved());
        assertEquals(90, savedInventory.getAvailableStock());
        assertEquals(20, savedInventory.getMinThreshold());
        
        // Retrieve by ID and verify
        Optional<Inventory> foundInventory = inventoryRepository.findById(savedInventory.getInventoryId());
        assertTrue(foundInventory.isPresent());
        assertEquals(savedInventory.getInventoryId(), foundInventory.get().getInventoryId());
    }
    
    @Test
    public void testFindByProductId() {
        // Create and save test inventory
        Inventory inventory = Inventory.builder()
            .productId(102L)
            .stock(50)
            .reserved(5)
            .availableStock(45)
            .minThreshold(10)
            .build();
            
        inventoryRepository.save(inventory);
        
        // Find by product ID
        Optional<Inventory> foundInventory = inventoryRepository.findByProductId(102L);
        
        // Verify
        assertTrue(foundInventory.isPresent());
        assertEquals(102L, foundInventory.get().getProductId());
        assertEquals(50, foundInventory.get().getStock());
    }
    
    @Test
    public void testLowStockInventory() {
        // Create and save multiple inventory items with different stock levels
        Inventory inventory1 = Inventory.builder()
            .productId(103L)
            .stock(5)
            .reserved(0)
            .availableStock(5)
            .minThreshold(10) // Low stock
            .build();
            
        Inventory inventory2 = Inventory.builder()
            .productId(104L)
            .stock(8)
            .reserved(2)
            .availableStock(6)
            .minThreshold(10) // Low available stock
            .build();
            
        Inventory inventory3 = Inventory.builder()
            .productId(105L)
            .stock(20)
            .reserved(5)
            .availableStock(15)
            .minThreshold(10) // Good stock
            .build();
            
        inventoryRepository.saveAll(List.of(inventory1, inventory2, inventory3));
        
        // Find all products and filter by low stock
        List<Inventory> allItems = inventoryRepository.findAll();
        List<Inventory> lowStockItems = allItems.stream()
            .filter(i -> i.getAvailableStock() < i.getMinThreshold())
            .toList();
        
        // Verify
        assertEquals(2, lowStockItems.size());
        assertTrue(lowStockItems.stream().anyMatch(i -> i.getProductId().equals(103L)));
        assertTrue(lowStockItems.stream().anyMatch(i -> i.getProductId().equals(104L)));
        assertFalse(lowStockItems.stream().anyMatch(i -> i.getProductId().equals(105L)));
    }
    
    @Test
    public void testUpdateInventory() {
        // Create and save test inventory
        Inventory inventory = Inventory.builder()
            .productId(106L)
            .stock(100)
            .reserved(10)
            .availableStock(90)
            .minThreshold(20)
            .build();
            
        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Update inventory
        savedInventory.setStock(150);
        savedInventory.setReserved(15);
        savedInventory.setAvailableStock(135);
        inventoryRepository.save(savedInventory);
        
        // Verify update
        Optional<Inventory> updatedInventory = inventoryRepository.findById(savedInventory.getInventoryId());
        assertTrue(updatedInventory.isPresent());
        assertEquals(150, updatedInventory.get().getStock());
        assertEquals(15, updatedInventory.get().getReserved());
        assertEquals(135, updatedInventory.get().getAvailableStock());
    }
}
