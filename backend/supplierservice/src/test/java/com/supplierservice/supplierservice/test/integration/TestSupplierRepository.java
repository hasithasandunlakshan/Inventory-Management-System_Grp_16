package com.supplierservice.supplierservice.test.integration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestSupplierRepository extends JpaRepository<TestSupplier, Long> {
    // Add custom query methods if needed
}
