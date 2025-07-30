package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.models.Supplier;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierCategoryRepository categoryRepository;

    public SupplierService(SupplierRepository supplierRepository, SupplierCategoryRepository categoryRepository) {
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
    }

    public Supplier createSupplier(SupplierDTO dto) {
        SupplierCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactInfo(dto.getContactInfo())
                .category(category)
                .build();

        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
    }
}
