package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.models.Supplier;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierCategoryRepository categoryRepository;

    public SupplierService(SupplierRepository supplierRepository, SupplierCategoryRepository categoryRepository) {
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
    }

    /** Create and return the saved supplier as a DTO (flattened). */
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        SupplierCategory category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));
        }

        // For now, create supplier without user relationship
        // TODO: Implement proper user lookup when user management is integrated
        Supplier supplier = Supplier.builder()
                .category(category)
                .user(null) // Will be set when user integration is complete
                .build();

        Supplier saved = supplierRepository.save(supplier);

        // Try to return with the projection, but fall back to basic info if user
        // relationship fails
        try {
            return supplierRepository.findByIdAsDto(saved.getSupplierId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to load created supplier"));
        } catch (Exception e) {
            // Fallback response if user relationship queries fail
            return SupplierDTO.builder()
                    .supplierId(saved.getSupplierId())
                    .userId(dto.getUserId())
                    .userName("Pending User Assignment")
                    .categoryId(category != null ? category.getCategoryId() : null)
                    .categoryName(category != null ? category.getName() : null)
                    .build();
        }
    }

    /** Read all suppliers as DTOs to avoid lazy-loading issues. */
    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        try {
            // First try the JPQL query
            return supplierRepository.findAllAsDto();
        } catch (Exception e) {
            System.err.println("JPQL query failed, trying native query: " + e.getMessage());
            try {
                // Try native SQL query
                List<Object[]> results = supplierRepository.findAllSuppliersNative();
                return results.stream()
                        .map(row -> new SupplierDTO(
                                ((Number) row[0]).longValue(), // supplierId
                                ((Number) row[1]).longValue(), // userId
                                (String) row[2], // userName
                                row[3] != null ? ((Number) row[3]).longValue() : null, // categoryId
                                (String) row[4] // categoryName
                        ))
                        .collect(java.util.stream.Collectors.toList());
            } catch (Exception nativeEx) {
                System.err.println("Native query also failed, using fallback: " + nativeEx.getMessage());
                return supplierRepository.findAllAsDtoWithoutUser();
            }
        }
    }

    /** Read one supplier as a DTO. */
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        return supplierRepository.findByIdAsDto(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));
    }

    /** Update supplier and return the updated supplier as a DTO. */
    @Transactional
    public SupplierDTO updateSupplier(SupplierDTO dto) {
        Supplier existingSupplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

        // Update category if provided
        if (dto.getCategoryId() != null) {
            SupplierCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));
            existingSupplier.setCategory(category);
        }

        // Note: User updates should be handled through a separate user management
        // service
        // For now, we'll keep the existing user relationship

        Supplier saved = supplierRepository.save(existingSupplier);

        return supplierRepository.findByIdAsDto(saved.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to load updated supplier"));
    }

    /** Delete supplier by ID. */
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));

        // TODO: Add business logic validation (e.g., check for active purchase orders)
        supplierRepository.delete(supplier);
    }
}
