package com.supplierservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.supplierservice.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    // Custom query methods can be added here
}
