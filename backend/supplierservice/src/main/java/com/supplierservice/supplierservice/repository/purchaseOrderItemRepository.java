package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
}
