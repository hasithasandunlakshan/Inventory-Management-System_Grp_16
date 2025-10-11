package com.InventoryMangementSystem.inventoryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.InventoryMangementSystem.inventoryservice.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
