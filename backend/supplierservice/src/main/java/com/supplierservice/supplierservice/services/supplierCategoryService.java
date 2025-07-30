package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierCategoryDTO;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierCategoryService {

    private final SupplierCategoryRepository categoryRepository;

    public SupplierCategoryService(SupplierCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public SupplierCategory createCategory(SupplierCategoryDTO dto) {
        SupplierCategory category = SupplierCategory.builder()
                .name(dto.getName())
                .build();

        return categoryRepository.save(category);
    }

    public List<SupplierCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
