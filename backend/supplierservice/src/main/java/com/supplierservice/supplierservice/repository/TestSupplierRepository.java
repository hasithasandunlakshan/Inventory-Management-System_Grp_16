package com.supplierservice.supplierservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.supplierservice.supplierservice.models.TestSupplier;

public interface TestSupplierRepository extends JpaRepository<TestSupplier, Long> {
}
