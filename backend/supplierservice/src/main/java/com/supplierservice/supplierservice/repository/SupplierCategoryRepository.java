package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.SupplierCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierCategoryRepository extends JpaRepository<SupplierCategory, Long> {
}
