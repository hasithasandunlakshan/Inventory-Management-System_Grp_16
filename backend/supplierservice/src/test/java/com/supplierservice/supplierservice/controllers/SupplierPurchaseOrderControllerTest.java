package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.dto.SupplierSpendDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SupplierPurchaseOrderControllerTest {
    @Mock
    private PurchaseOrderService orderService;

    @InjectMocks
    private SupplierPurchaseOrderController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void listSupplierPOs_returnsPage() {
        Page<PurchaseOrderSummaryDTO> page = new PageImpl<>(Collections.singletonList(new PurchaseOrderSummaryDTO()));
        when(orderService.listBySupplier(anyLong(), anyInt(), anyInt(), any(), any(), any(), any())).thenReturn(page);
        ResponseEntity<Page<PurchaseOrderSummaryDTO>> response = controller.listSupplierPOs(1L, 0, 20, null, null, null,
                null);
        assertEquals(page, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void listOpenSupplierPOs_returnsList() {
        List<PurchaseOrderSummaryDTO> list = Arrays.asList(new PurchaseOrderSummaryDTO(),
                new PurchaseOrderSummaryDTO());
        when(orderService.listOpenBySupplier(1L)).thenReturn(list);
        ResponseEntity<List<PurchaseOrderSummaryDTO>> response = controller.listOpenSupplierPOs(1L);
        assertEquals(list, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void supplierSpend_returnsSpendDTO() {
        SupplierSpendDTO spend = new SupplierSpendDTO();
        when(orderService.supplierSpend(eq(1L), any(), any())).thenReturn(spend);
        ResponseEntity<SupplierSpendDTO> response = controller.supplierSpend(1L, LocalDate.now(), LocalDate.now());
        assertEquals(spend, response.getBody());
        assertEquals(200, response.getStatusCode().value());
    }
}
