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
        SupplierCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));

        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactInfo(dto.getContactInfo())
                .category(category)
                .build();

        Supplier saved = supplierRepository.save(supplier);

        // Reuse the projection so the response includes categoryName and latest score
        // (if any)
        return supplierRepository.findByIdAsDto(saved.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to load created supplier"));
    }

    /** Read all suppliers as DTOs to avoid lazy-loading issues. */
    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAllAsDto();
    }

    /** Read one supplier as a DTO. */
    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        return supplierRepository.findByIdAsDto(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found"));
    }
}
