package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.services.PurchaseOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseOrderControllerTest {
    @Mock
    private PurchaseOrderService orderService;

    @InjectMocks
    private PurchaseOrderController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createOrder_returnsCreatedOrder() {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        when(orderService.createPurchaseOrder(any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderDTO> response = controller.createOrder(dto);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void getAllOrders_returnsList() {
        List<PurchaseOrderSummaryDTO> list = Collections.singletonList(new PurchaseOrderSummaryDTO());
        when(orderService.getAllOrders()).thenReturn(list);
        ResponseEntity<List<PurchaseOrderSummaryDTO>> response = controller.getAllOrders();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(list, response.getBody());
    }

    @Test
    void getOrder_returnsOrder() {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        when(orderService.getOrderById(1L)).thenReturn(dto);
        ResponseEntity<PurchaseOrderDTO> response = controller.getOrder(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void updateOrder_returnsUpdatedOrder() {
        PurchaseOrderUpdateDTO updateDTO = new PurchaseOrderUpdateDTO();
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        when(orderService.updatePurchaseOrder(eq(1L), any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderDTO> response = controller.updateOrder(1L, updateDTO);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void deleteOrder_returnsNoContent() {
        doNothing().when(orderService).deletePurchaseOrder(anyLong(), anyBoolean(), any());
        ResponseEntity<Void> response = controller.deleteOrder(1L, false, null);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void changeStatus_returnsUpdatedOrder() {
        StatusUpdateDTO statusUpdateDTO = new StatusUpdateDTO();
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        when(orderService.updateStatus(eq(1L), any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderDTO> response = controller.changeStatus(1L, statusUpdateDTO);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void markReceived_returnsUpdatedOrder() {
        ReceiveRequestDTO receiveRequestDTO = new ReceiveRequestDTO();
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        when(orderService.markReceived(eq(1L), any())).thenReturn(dto);
        ResponseEntity<PurchaseOrderDTO> response = controller.markReceived(1L, receiveRequestDTO);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void search_returnsPage() {
        Page<PurchaseOrderSummaryDTO> page = new PageImpl<>(Arrays.asList(new PurchaseOrderSummaryDTO()));
        when(orderService.search(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), any()))
                .thenReturn(page);
        ResponseEntity<Page<PurchaseOrderSummaryDTO>> response = controller.search(null, null, null, null, null, null,
                null, 0, 20, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(page, response.getBody());
    }

    @Test
    void statsSummary_returnsStats() {
        StatsSummaryDTO stats = new StatsSummaryDTO();
        when(orderService.kpiSummary(any(), any(), any(), any(), any())).thenReturn(stats);
        ResponseEntity<StatsSummaryDTO> response = controller.statsSummary(null, null, null, null, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(stats, response.getBody());
    }

    @Test
    void totals_returnsTotals() {
        TotalsDTO totals = new TotalsDTO();
        when(orderService.computeTotals(1L)).thenReturn(totals);
        ResponseEntity<TotalsDTO> response = controller.totals(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(totals, response.getBody());
    }

    @Test
    void exportCsv_returnsCsvFile() {
        byte[] csv = "id,name\n1,Test".getBytes();
        when(orderService.exportCsv(any(), any(), any(), any(), any())).thenReturn(csv);
        ResponseEntity<byte[]> response = controller.exportCsv(null, null, null, null, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertArrayEquals(csv, response.getBody());
        assertTrue(response.getHeaders().get("Content-Disposition").get(0).contains("filename=purchase_orders.csv"));
        assertTrue(response.getHeaders().get("Content-Type").get(0).contains("text/csv"));
    }

    @Test
    void importCsv_returnsImportReport() {
        ImportReportDTO report = new ImportReportDTO();
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", "id,name\n1,Test".getBytes());
        when(orderService.importCsv(any())).thenReturn(report);
        ResponseEntity<ImportReportDTO> response = controller.importCsv(file);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(report, response.getBody());
    }
}
