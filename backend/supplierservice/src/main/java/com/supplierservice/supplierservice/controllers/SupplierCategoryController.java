package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.SupplierCategoryDTO;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.services.SupplierCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-categories")
public class SupplierCategoryController {

    private final SupplierCategoryService categoryService;

    public SupplierCategoryController(SupplierCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<SupplierCategoryDTO> createCategory(@RequestBody SupplierCategoryDTO dto) {
        SupplierCategory created = categoryService.createCategory(dto);
        return ResponseEntity.ok(new SupplierCategoryDTO(created.getCategoryId(), created.getName()));
    }

    @GetMapping
    public ResponseEntity<List<SupplierCategoryDTO>> getAllCategories() {
        List<SupplierCategory> categories = categoryService.getAllCategories();
        List<SupplierCategoryDTO> dtos = categories.stream()
                .map(cat -> new SupplierCategoryDTO(cat.getCategoryId(), cat.getName()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
