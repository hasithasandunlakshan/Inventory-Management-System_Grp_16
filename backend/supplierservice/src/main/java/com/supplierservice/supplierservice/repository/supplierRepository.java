package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /**
     * Returns suppliers as flattened DTOs.
     * - Joins category for (id, name)
     * - Joins the LATEST SupplierScore by lastUpdated (if you store a history)
     * If you actually have a 1–1 mapping, this still works fine.
     */
    @Query("""
                select new com.supplierservice.supplierservice.dto.SupplierDTO(
                    s.supplierId,
                    s.user.userId,
                    s.user.fullName,
                    s.category.categoryId,
                    s.category.name
                )
                from Supplier s
            """)
    List<SupplierDTO> findAllAsDto();

    @Query("""
                select new com.supplierservice.supplierservice.dto.SupplierDTO(
                    s.supplierId,
                    s.user.userId,
                    s.user.fullName,
                    s.category.categoryId,
                    s.category.name
                )
                from Supplier s
                where s.supplierId = :id
            """)
    Optional<SupplierDTO> findByIdAsDto(@Param("id") Long id);
}
