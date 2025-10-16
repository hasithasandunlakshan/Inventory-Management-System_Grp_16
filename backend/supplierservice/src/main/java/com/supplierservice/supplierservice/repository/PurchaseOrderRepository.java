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

        // ===== Metrics helpers =====
        long countBySupplier_SupplierIdAndDateBetween(Long supplierId, LocalDate start, LocalDate end);

        @Query("""
                        select count(po) from PurchaseOrder po
                        where po.supplier.supplierId = :supplierId
                          and po.date between :start and :end
                          and po.status = :status
                        """)
        long countBySupplierAndStatusInRange(@Param("supplierId") Long supplierId,
                        @Param("start") LocalDate start,
                        @Param("end") LocalDate end,
                        @Param("status") PurchaseOrderStatus status);

        @Query("""
                        select max(po.date) from PurchaseOrder po
                        where po.supplier.supplierId = :supplierId
                        """)
        LocalDate findLastOrderDate(@Param("supplierId") Long supplierId);

        // ===== ML Metrics methods =====
        @Query("""
                        select coalesce(sum(poi.quantity * poi.unitPrice), 0.0)
                        from PurchaseOrder po
                        join po.items poi
                        where po.supplier.supplierId = :supplierId
                          and po.date between :startDate and :endDate
                        """)
        Double calculateTotalSpendBySupplier(@Param("supplierId") Long supplierId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("""
                        select count(po) from PurchaseOrder po
                        where po.supplier.supplierId = :supplierId
                          and po.status in ('PENDING', 'APPROVED', 'ORDERED', 'SHIPPED')
                        """)
        Integer countOpenPurchaseOrdersBySupplier(@Param("supplierId") Long supplierId);
}
