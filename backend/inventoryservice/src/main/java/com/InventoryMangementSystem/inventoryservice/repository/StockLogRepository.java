package com.InventoryMangementSystem.inventoryservice.repository;

import com.InventoryMangementSystem.inventoryservice.models.StockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    List<StockLog> findByItemId(Long itemId);
}