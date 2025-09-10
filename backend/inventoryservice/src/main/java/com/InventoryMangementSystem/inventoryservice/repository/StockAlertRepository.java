package com.InventoryMangementSystem.inventoryservice.repository;

import com.InventoryMangementSystem.inventoryservice.models.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    List<StockAlert> findByProductId(Long productId);

    List<StockAlert> findByIsResolvedFalse();

    boolean existsByProductIdAndAlertTypeAndIsResolvedFalse(Long productId, String alertType);

    List<StockAlert> findAllByOrderByCreatedAtDesc();

    StockAlert findTopByProductIdAndAlertTypeOrderByCreatedAtDesc(Long productId, String alertType);
}
