package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long>, JpaSpecificationExecutor<PurchaseOrder> {

    // For listing: fetch supplier to show supplierName without lazy issues
    @Override
    @EntityGraph(attributePaths = { "supplier" })
    List<PurchaseOrder> findAll();

    // For detail: fetch items + supplier in one go to avoid
    // LazyInitializationException
    @Query("""
            select po from PurchaseOrder po
            left join fetch po.items i
            left join fetch po.supplier s
            where po.poId = :id
            """)
    Optional<PurchaseOrder> findByIdWithItems(Long id);
}
