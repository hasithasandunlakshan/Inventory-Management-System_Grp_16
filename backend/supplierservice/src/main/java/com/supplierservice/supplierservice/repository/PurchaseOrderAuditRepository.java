package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrderAuditEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderAuditRepository extends JpaRepository<PurchaseOrderAuditEntry, Long> {
    List<PurchaseOrderAuditEntry> findByPurchaseOrder_PoIdOrderByCreatedAtDesc(Long poId);
}
