
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierCategoryDTO;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SupplierCategoryServiceTest {

    @Mock
    private SupplierCategoryRepository categoryRepository;

    @InjectMocks
    private SupplierCategoryService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createCategory_success() {
        SupplierCategoryDTO dto = SupplierCategoryDTO.builder().name("Electronics").build();
        SupplierCategory category = SupplierCategory.builder().categoryId(1L).name("Electronics").build();
        when(categoryRepository.save(any())).thenReturn(category);
        SupplierCategory result = service.createCategory(dto);
        assertNotNull(result);
        assertEquals("Electronics", result.getName());
    }

    @Test
    void getAllCategories_returnsList() {
        SupplierCategory category1 = SupplierCategory.builder().categoryId(1L).name("Electronics").build();
        SupplierCategory category2 = SupplierCategory.builder().categoryId(2L).name("Furniture").build();
        when(categoryRepository.findAll()).thenReturn(List.of(category1, category2));
        List<SupplierCategory> result = service.getAllCategories();
        assertEquals(2, result.size());
        assertEquals("Furniture", result.get(1).getName());
    }
}
