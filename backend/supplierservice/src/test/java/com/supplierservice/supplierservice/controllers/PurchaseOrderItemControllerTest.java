package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.QuantityUpdateDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseOrderItemControllerTest {
    @Mock
    private PurchaseOrderItemService itemService;

    @InjectMocks
    private PurchaseOrderItemController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void list_returnsItems() {
        List<PurchaseOrderItemDTO> items = Arrays.asList(new PurchaseOrderItemDTO(), new PurchaseOrderItemDTO());
        when(itemService.listItems(1L)).thenReturn(items);
        ResponseEntity<List<PurchaseOrderItemDTO>> response = controller.list(1L);
        assertEquals(items, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void add_returnsAddedItems() {
        List<PurchaseOrderItemDTO> items = Arrays.asList(new PurchaseOrderItemDTO(), new PurchaseOrderItemDTO());
        when(itemService.addItems(eq(1L), anyList())).thenReturn(items);
        ResponseEntity<List<PurchaseOrderItemDTO>> response = controller.add(1L, items);
        assertEquals(items, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void update_returnsUpdatedItem() {
        PurchaseOrderItemDTO dto = new PurchaseOrderItemDTO();
        when(itemService.updateItem(eq(1L), eq(2L), any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderItemDTO> response = controller.update(1L, 2L, dto);
        assertEquals(dto, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void delete_returnsNoContent() {
        doNothing().when(itemService).deleteItem(1L, 2L);
        ResponseEntity<Void> response = controller.delete(1L, 2L);
        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
    }

    @Test
    void patchQuantity_returnsPatchedItem() {
        QuantityUpdateDTO patch = new QuantityUpdateDTO();
        PurchaseOrderItemDTO dto = new PurchaseOrderItemDTO();
        when(itemService.patchQuantity(eq(1L), eq(2L), any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderItemDTO> response = controller.patchQuantity(1L, 2L, patch);
        assertEquals(dto, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }
}
