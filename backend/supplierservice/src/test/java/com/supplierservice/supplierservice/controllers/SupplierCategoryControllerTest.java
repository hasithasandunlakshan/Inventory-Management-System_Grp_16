package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.SupplierCategoryDTO;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.services.SupplierCategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SupplierCategoryControllerTest {
    @Mock
    private SupplierCategoryService categoryService;

    @InjectMocks
    private SupplierCategoryController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createCategory_returnsCreatedCategory() {
        SupplierCategoryDTO dto = new SupplierCategoryDTO(1L, "TestCat");
        SupplierCategory created = new SupplierCategory();
        created.setCategoryId(1L);
        created.setName("TestCat");
        when(categoryService.createCategory(any())).thenReturn(created);
        ResponseEntity<SupplierCategoryDTO> response = controller.createCategory(dto);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(dto.getCategoryId(), response.getBody().getCategoryId());
        assertEquals(dto.getName(), response.getBody().getName());
    }

    @Test
    void getAllCategories_returnsListOfDTOs() {
        SupplierCategory cat1 = new SupplierCategory();
        cat1.setCategoryId(1L);
        cat1.setName("Cat1");
        SupplierCategory cat2 = new SupplierCategory();
        cat2.setCategoryId(2L);
        cat2.setName("Cat2");
        List<SupplierCategory> categories = Arrays.asList(cat1, cat2);
        when(categoryService.getAllCategories()).thenReturn(categories);
        ResponseEntity<List<SupplierCategoryDTO>> response = controller.getAllCategories();
        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().size());
        assertEquals(cat1.getCategoryId(), response.getBody().get(0).getCategoryId());
        assertEquals(cat1.getName(), response.getBody().get(0).getName());
        assertEquals(cat2.getCategoryId(), response.getBody().get(1).getCategoryId());
        assertEquals(cat2.getName(), response.getBody().get(1).getName());
    }
}
