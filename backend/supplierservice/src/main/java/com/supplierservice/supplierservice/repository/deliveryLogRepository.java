package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.DeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryLogRepository extends JpaRepository<DeliveryLog, Long> {
}
