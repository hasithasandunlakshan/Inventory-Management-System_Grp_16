package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.SupplierDTO;
import com.supplierservice.supplierservice.services.SupplierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SupplierControllerTest {
    @Mock
    private SupplierService supplierService;

    @InjectMocks
    private SupplierController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createSupplier_returnsCreatedSupplier() {
        SupplierDTO dto = new SupplierDTO();
        SupplierDTO created = new SupplierDTO();
        when(supplierService.createSupplier(any())).thenReturn(created);
        ResponseEntity<SupplierDTO> response = controller.createSupplier(dto);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(created, response.getBody());
    }

    @Test
    void getAllSuppliers_returnsList() {
        List<SupplierDTO> list = Arrays.asList(new SupplierDTO(), new SupplierDTO());
        when(supplierService.getAllSuppliers()).thenReturn(list);
        ResponseEntity<List<SupplierDTO>> response = controller.getAllSuppliers();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(list, response.getBody());
    }

    @Test
    void getSupplierById_returnsSupplier() {
        SupplierDTO dto = new SupplierDTO();
        when(supplierService.getSupplierById(1L)).thenReturn(dto);
        ResponseEntity<SupplierDTO> response = controller.getSupplierById(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void updateSupplier_returnsUpdatedSupplier() {
        SupplierDTO dto = new SupplierDTO();
        SupplierDTO updated = new SupplierDTO();
        when(supplierService.updateSupplier(any())).thenReturn(updated);
        ResponseEntity<SupplierDTO> response = controller.updateSupplier(1L, dto);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updated, response.getBody());
    }

    @Test
    void deleteSupplier_returnsNoContent() {
        doNothing().when(supplierService).deleteSupplier(1L);
        ResponseEntity<Void> response = controller.deleteSupplier(1L);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
    }
}
