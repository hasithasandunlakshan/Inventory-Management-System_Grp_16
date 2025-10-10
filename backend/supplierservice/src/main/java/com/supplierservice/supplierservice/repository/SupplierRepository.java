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
     * Returns suppliers as flattened DTOs with user information
     * Joins suppliers table with users table and categories
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
                JOIN s.user
                LEFT JOIN s.category
            """)
    List<SupplierDTO> findAllAsDto();

    /**
     * Native SQL query as backup - directly queries the database
     */
    @Query(value = """
            SELECT s.supplier_id as supplierId,
                   u.user_id as userId,
                   u.full_name as userName,
                   sc.category_id as categoryId,
                   sc.name as categoryName
            FROM suppliers s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN supplier_categories sc ON s.category_id = sc.category_id
            """, nativeQuery = true)
    List<Object[]> findAllSuppliersNative();

    /**
     * Fallback query that doesn't depend on user relationships
     * Use this if the user relationship is not properly set up
     */
    @Query("""
                select new com.supplierservice.supplierservice.dto.SupplierDTO(
                    s.supplierId,
                    0L,
                    'Unknown User',
                    s.category.categoryId,
                    s.category.name
                )
                from Supplier s
                LEFT JOIN s.category
            """)
    List<SupplierDTO> findAllAsDtoWithoutUser();

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
