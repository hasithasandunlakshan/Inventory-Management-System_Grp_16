package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.models.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

        // Find recent purchase orders for a supplier
        @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.supplierId = :supplierId " +
                        "AND po.date >= :startDate")
        List<PurchaseOrder> findBySupplierIdAndDateAfter(
                        @Param("supplierId") Long supplierId,
                        @Param("startDate") LocalDate startDate);

        // Count open purchase orders for a supplier
        @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.supplier.supplierId = :supplierId " +
                        "AND po.status IN ('SENT', 'PENDING')")
        Integer countOpenPurchaseOrdersBySupplier(@Param("supplierId") Long supplierId);

        // Get total spend for a supplier within date range
        @Query("SELECT SUM(poi.unitPrice * poi.quantity) FROM PurchaseOrder po " +
                        "JOIN po.items poi WHERE po.supplier.supplierId = :supplierId " +
                        "AND po.date >= :startDate AND po.date <= :endDate " +
                        "AND po.status <> 'CANCELLED'")
        Double calculateTotalSpendBySupplier(
                        @Param("supplierId") Long supplierId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
}
