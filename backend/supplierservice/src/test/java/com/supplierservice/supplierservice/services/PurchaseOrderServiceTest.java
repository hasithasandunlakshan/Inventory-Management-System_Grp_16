
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.*;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private PurchaseOrderItemRepository itemRepository;
    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private PurchaseOrderService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createPurchaseOrder_success() {
        Supplier supplier = Supplier.builder().supplierId(1L).user(User.builder().fullName("Test User").build())
                .build();
        PurchaseOrderDTO dto = PurchaseOrderDTO.builder()
                .supplierId(1L)
                .date(LocalDate.now())
                .status("DRAFT")
                .items(List.of(PurchaseOrderItemDTO.builder().itemId(2L).quantity(3).unitPrice(10.0).build()))
                .build();
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        PurchaseOrderDTO result = service.createPurchaseOrder(dto);
        assertEquals("Test User", result.getSupplierName());
        assertEquals(1, result.getItems().size());
    }

    @Test
    void createPurchaseOrder_supplierNotFound() {
        PurchaseOrderDTO dto = PurchaseOrderDTO.builder().supplierId(99L).build();
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(IllegalArgumentException.class, () -> service.createPurchaseOrder(dto));
        assertTrue(ex.getMessage().contains("Supplier not found"));
    }

    @Test
    void getOrderById_success() {
        Supplier supplier = Supplier.builder().supplierId(1L).user(User.builder().fullName("Test User").build())
                .build();
        PurchaseOrder po = PurchaseOrder.builder().poId(10L).supplier(supplier).date(LocalDate.now())
                .status(PurchaseOrderStatus.DRAFT).items(new ArrayList<>()).build();
        when(purchaseOrderRepository.findByIdWithItems(10L)).thenReturn(Optional.of(po));
        PurchaseOrderDTO result = service.getOrderById(10L);
        assertEquals(10L, result.getId());
        assertEquals("Test User", result.getSupplierName());
    }

    @Test
    void getOrderById_notFound() {
        when(purchaseOrderRepository.findByIdWithItems(10L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(IllegalArgumentException.class, () -> service.getOrderById(10L));
        assertTrue(ex.getMessage().contains("Purchase order not found"));
    }

    @Test
    void updateStatus_success() {
        Long id = 1L;
        StatusUpdateDTO body = new StatusUpdateDTO("SENT", null);
        Supplier supplier = Supplier.builder().supplierId(1L).user(User.builder().fullName("Test User").build())
                .build();
        PurchaseOrder po = PurchaseOrder.builder().poId(id).supplier(supplier).date(LocalDate.now())
                .status(PurchaseOrderStatus.DRAFT).items(new ArrayList<>()).build();
        when(purchaseOrderRepository.findByIdWithItems(id)).thenReturn(Optional.of(po));
        when(purchaseOrderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        PurchaseOrderDTO result = service.updateStatus(id, body);
        assertEquals("SENT", result.getStatus());
    }

    @Test
    void updateStatus_invalidTransition() {
        Long id = 1L;
        StatusUpdateDTO body = new StatusUpdateDTO("DRAFT", null);
        Supplier supplier = Supplier.builder().supplierId(1L).user(User.builder().fullName("Test User").build())
                .build();
        PurchaseOrder po = PurchaseOrder.builder().poId(id).supplier(supplier).date(LocalDate.now())
                .status(PurchaseOrderStatus.RECEIVED).items(new ArrayList<>()).build();
        when(purchaseOrderRepository.findByIdWithItems(id)).thenReturn(Optional.of(po));
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.updateStatus(id, body));
        assertEquals(HttpStatus.CONFLICT, ((ResponseStatusException) ex).getStatusCode());
    }
}
