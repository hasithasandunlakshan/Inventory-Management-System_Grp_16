package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrderNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderNoteRepository extends JpaRepository<PurchaseOrderNote, Long> {
    List<PurchaseOrderNote> findByPurchaseOrder_PoIdOrderByCreatedAtDesc(Long poId);
}
