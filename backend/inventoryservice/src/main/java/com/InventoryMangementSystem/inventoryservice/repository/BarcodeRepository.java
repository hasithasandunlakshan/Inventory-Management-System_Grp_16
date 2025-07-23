package com.InventoryMangementSystem.inventoryservice.repository;

import com.InventoryMangementSystem.inventoryservice.models.Barcode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BarcodeRepository extends JpaRepository<Barcode,Long> {
}
