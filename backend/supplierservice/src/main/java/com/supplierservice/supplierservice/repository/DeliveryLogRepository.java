package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.DeliveryLog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryLogRepository extends JpaRepository<DeliveryLog, Long> {
    @Query("SELECT d FROM DeliveryLog d JOIN FETCH d.purchaseOrder WHERE d.purchaseOrder.poId = :poId")
    List<DeliveryLog> findAllByPoId(@Param("poId") Long poId);

    @Query("SELECT d FROM DeliveryLog d JOIN FETCH d.purchaseOrder ORDER BY d.receivedDate DESC LIMIT 10")
    List<DeliveryLog> findTop10ByOrderByReceivedDateDesc();
}
