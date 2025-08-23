package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrderAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderAttachmentRepository extends JpaRepository<PurchaseOrderAttachment, Long> {
    List<PurchaseOrderAttachment> findByPurchaseOrder_PoIdOrderByUploadedAtDesc(Long poId);
}
