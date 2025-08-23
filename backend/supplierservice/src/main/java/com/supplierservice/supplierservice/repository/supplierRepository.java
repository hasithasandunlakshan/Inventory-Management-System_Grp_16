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
                    s.name,
                    s.contactInfo,
                    c.categoryId,
                    c.name,
                    ss.reliabilityScore,
                    ss.lastUpdated
                )
                from Supplier s
                left join s.category c
                left join SupplierScore ss
                    on ss.supplier = s
                   and ss.lastUpdated = (
                        select max(ss2.lastUpdated)
                        from SupplierScore ss2
                        where ss2.supplier = s
                    )
                order by s.supplierId asc
            """)
    List<SupplierDTO> findAllAsDto();

    @Query("""
                select new com.supplierservice.supplierservice.dto.SupplierDTO(
                    s.supplierId,
                    s.name,
                    s.contactInfo,
                    c.categoryId,
                    c.name,
                    ss.reliabilityScore,
                    ss.lastUpdated
                )
                from Supplier s
                left join s.category c
                left join SupplierScore ss
                    on ss.supplier = s
                   and ss.lastUpdated = (
                        select max(ss2.lastUpdated)
                        from SupplierScore ss2
                        where ss2.supplier = s
                    )
                where s.supplierId = :id
            """)
    Optional<SupplierDTO> findByIdAsDto(@Param("id") Long id);
}
