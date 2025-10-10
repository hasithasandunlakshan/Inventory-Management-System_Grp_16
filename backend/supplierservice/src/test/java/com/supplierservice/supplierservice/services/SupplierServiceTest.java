
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.models.Supplier;
import com.supplierservice.supplierservice.models.SupplierCategory;
import com.supplierservice.supplierservice.models.User;
import com.supplierservice.supplierservice.repository.SupplierCategoryRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import com.supplierservice.supplierservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private SupplierCategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupplierService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createSupplier_success() {
        SupplierDTO dto = SupplierDTO.builder().userId(1L).categoryId(2L).build();
        SupplierCategory category = SupplierCategory.builder().categoryId(2L).name("Cat").build();
        User user = User.builder().userId(1L).fullName("User").build();
        Supplier supplier = Supplier.builder().supplierId(3L).category(category).user(user).build();
        SupplierDTO expected = SupplierDTO.builder().supplierId(3L).userId(1L).categoryId(2L).userName("User")
                .categoryName("Cat").build();
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(supplierRepository.save(any())).thenReturn(supplier);
        when(supplierRepository.findByIdAsDto(3L)).thenReturn(Optional.of(expected));
        SupplierDTO result = service.createSupplier(dto);
        assertEquals(3L, result.getSupplierId());
        assertEquals("User", result.getUserName());
    }

    @Test
    void createSupplier_invalidCategory() {
        SupplierDTO dto = SupplierDTO.builder().userId(1L).categoryId(2L).build();
        when(categoryRepository.findById(2L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(User.builder().userId(1L).build()));
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.createSupplier(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ((ResponseStatusException) ex).getStatusCode());
    }

    @Test
    void createSupplier_invalidUser() {
        SupplierDTO dto = SupplierDTO.builder().userId(1L).categoryId(2L).build();
        SupplierCategory category = SupplierCategory.builder().categoryId(2L).build();
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.createSupplier(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ((ResponseStatusException) ex).getStatusCode());
    }

    @Test
    void getAllSuppliers_success() {
        SupplierDTO dto = SupplierDTO.builder().supplierId(1L).userId(2L).userName("User").categoryId(3L)
                .categoryName("Cat").build();
        when(supplierRepository.findAllAsDto()).thenReturn(List.of(dto));
        List<SupplierDTO> result = service.getAllSuppliers();
        assertEquals(1, result.size());
        assertEquals("User", result.get(0).getUserName());
    }

    @Test
    void getSupplierById_success() {
        SupplierDTO dto = SupplierDTO.builder().supplierId(1L).userId(2L).userName("User").categoryId(3L)
                .categoryName("Cat").build();
        when(supplierRepository.findByIdAsDto(1L)).thenReturn(Optional.of(dto));
        SupplierDTO result = service.getSupplierById(1L);
        assertEquals(1L, result.getSupplierId());
    }

    @Test
    void getSupplierById_notFound() {
        when(supplierRepository.findByIdAsDto(1L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.getSupplierById(1L));
        assertEquals(HttpStatus.NOT_FOUND, ((ResponseStatusException) ex).getStatusCode());
    }

    @Test
    void updateSupplier_success() {
        SupplierDTO dto = SupplierDTO.builder().supplierId(1L).categoryId(2L).build();
        Supplier existing = Supplier.builder().supplierId(1L).build();
        SupplierCategory category = SupplierCategory.builder().categoryId(2L).build();
        Supplier saved = Supplier.builder().supplierId(1L).category(category).build();
        SupplierDTO expected = SupplierDTO.builder().supplierId(1L).categoryId(2L).build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(supplierRepository.save(any())).thenReturn(saved);
        when(supplierRepository.findByIdAsDto(1L)).thenReturn(Optional.of(expected));
        SupplierDTO result = service.updateSupplier(dto);
        assertEquals(1L, result.getSupplierId());
        assertEquals(2L, result.getCategoryId());
    }

    @Test
    void updateSupplier_notFound() {
        SupplierDTO dto = SupplierDTO.builder().supplierId(1L).categoryId(2L).build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.updateSupplier(dto));
        assertEquals(HttpStatus.NOT_FOUND, ((ResponseStatusException) ex).getStatusCode());
    }

    @Test
    void updateSupplier_invalidCategory() {
        SupplierDTO dto = SupplierDTO.builder().supplierId(1L).categoryId(2L).build();
        Supplier existing = Supplier.builder().supplierId(1L).build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.findById(2L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.updateSupplier(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ((ResponseStatusException) ex).getStatusCode());
    }

    @Test
    void deleteSupplier_success() {
        Supplier supplier = Supplier.builder().supplierId(1L).build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        doNothing().when(supplierRepository).delete(supplier);
        assertDoesNotThrow(() -> service.deleteSupplier(1L));
        verify(supplierRepository, times(1)).delete(supplier);
    }

    @Test
    void deleteSupplier_notFound() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.deleteSupplier(1L));
        assertEquals(HttpStatus.NOT_FOUND, ((ResponseStatusException) ex).getStatusCode());
    }
}
