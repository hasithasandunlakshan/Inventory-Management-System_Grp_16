package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.models.Supplier;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.models.User;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import com.supplierservice.supplierservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public SupplierService(SupplierRepository supplierRepository,
            SupplierCategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    /** Create and return the saved supplier as a DTO (flattened). */
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        SupplierCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID"));

        Supplier supplier = Supplier.builder()
                .category(category)
                .user(user)
                .build();

        Supplier saved = supplierRepository.save(supplier);

        // Reuse the projection so the response includes categoryName and user info
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
