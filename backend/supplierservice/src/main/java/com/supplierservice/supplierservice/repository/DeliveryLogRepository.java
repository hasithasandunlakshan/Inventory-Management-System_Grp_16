package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.DeliveryLog;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryLogRepository extends JpaRepository<DeliveryLog, Long> {
    @Query("SELECT d FROM DeliveryLog d JOIN FETCH d.purchaseOrder WHERE d.purchaseOrder.poId = :poId")
    List<DeliveryLog> findAllByPoId(@Param("poId") Long poId);

    @Query("SELECT d FROM DeliveryLog d JOIN FETCH d.purchaseOrder ORDER BY d.receivedDate DESC LIMIT 10")
    List<DeliveryLog> findTop10ByOrderByReceivedDateDesc();

    // Get all deliveries for a supplier within a date range
    @Query("SELECT d FROM DeliveryLog d JOIN d.purchaseOrder po " +
            "WHERE po.supplier.supplierId = :supplierId " +
            "AND d.receivedDate >= :startDate AND d.receivedDate <= :endDate")
    List<DeliveryLog> findBySupplierIdAndDateBetween(
            @Param("supplierId") Long supplierId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Calculate on-time delivery rate
    @Query("SELECT COUNT(d) FROM DeliveryLog d JOIN d.purchaseOrder po " +
            "WHERE po.supplier.supplierId = :supplierId " +
            "AND d.receivedDate >= :startDate AND d.receivedDate <= :endDate " +
            "AND d.receivedDate <= po.date")
    Long countOnTimeDeliveries(
            @Param("supplierId") Long supplierId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Calculate total deliveries
    @Query("SELECT COUNT(d) FROM DeliveryLog d JOIN d.purchaseOrder po " +
            "WHERE po.supplier.supplierId = :supplierId " +
            "AND d.receivedDate >= :startDate AND d.receivedDate <= :endDate")
    Long countTotalDeliveries(
            @Param("supplierId") Long supplierId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
