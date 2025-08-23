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
    public ResponseEntity<SupplierCategory> createCategory(@RequestBody SupplierCategoryDTO dto) {
        return ResponseEntity.ok(categoryService.createCategory(dto));
    }

    @GetMapping
    public ResponseEntity<List<SupplierCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
