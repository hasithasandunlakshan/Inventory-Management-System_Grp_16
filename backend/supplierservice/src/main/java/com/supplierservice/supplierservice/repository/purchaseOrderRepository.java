package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
}
