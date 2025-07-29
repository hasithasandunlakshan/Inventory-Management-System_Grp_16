package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    // for adding custom query methods, if needed
}
