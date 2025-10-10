
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.QuantityUpdateDTO;
import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.models.PurchaseOrderItem;
import com.supplierservice.supplierservice.models.PurchaseOrderStatus;
import com.supplierservice.supplierservice.repository.PurchaseOrderItemRepository;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseOrderItemServiceTest {

    @Mock
    private PurchaseOrderRepository poRepo;
    @Mock
    private PurchaseOrderItemRepository itemRepo;

    @InjectMocks
    private PurchaseOrderItemService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void listItems_success() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItem item = PurchaseOrderItem.builder().id(2L).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(itemRepo.findByPurchaseOrder_PoId(poId)).thenReturn(List.of(item));
        List<PurchaseOrderItemDTO> result = service.listItems(poId);
        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getItemId());
    }

    @Test
    void addItems_success() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItemDTO dto = PurchaseOrderItemDTO.builder().itemId(3L).quantity(5).unitPrice(10.0).build();
        PurchaseOrderItem entity = PurchaseOrderItem.builder().id(2L).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        when(itemRepo.saveAll(anyList())).thenReturn(List.of(entity));
        List<PurchaseOrderItemDTO> result = service.addItems(poId, List.of(dto));
        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getItemId());
    }

    @Test
    void updateItem_success() {
        Long poId = 1L;
        Long itemId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItem entity = PurchaseOrderItem.builder().id(itemId).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        PurchaseOrderItemDTO dto = PurchaseOrderItemDTO.builder().itemId(4L).quantity(6).unitPrice(12.0).build();
        when(itemRepo.findById(itemId)).thenReturn(Optional.of(entity));
        when(itemRepo.save(any())).thenReturn(entity);
        PurchaseOrderItemDTO result = service.updateItem(poId, itemId, dto);
        assertEquals(4L, result.getItemId());
        assertEquals(6, result.getQuantity());
    }

    @Test
    void updateItem_wrongOwnership_throws() {
        Long poId = 1L;
        Long itemId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(99L).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItem entity = PurchaseOrderItem.builder().id(itemId).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        PurchaseOrderItemDTO dto = PurchaseOrderItemDTO.builder().itemId(4L).quantity(6).unitPrice(12.0).build();
        when(itemRepo.findById(itemId)).thenReturn(Optional.of(entity));
        Exception ex = assertThrows(IllegalArgumentException.class, () -> service.updateItem(poId, itemId, dto));
        assertTrue(ex.getMessage().contains("Item does not belong to purchase order"));
    }

    @Test
    void deleteItem_success() {
        Long poId = 1L;
        Long itemId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItem entity = PurchaseOrderItem.builder().id(itemId).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        when(itemRepo.findById(itemId)).thenReturn(Optional.of(entity));
        doNothing().when(itemRepo).delete(entity);
        assertDoesNotThrow(() -> service.deleteItem(poId, itemId));
        verify(itemRepo, times(1)).delete(entity);
    }

    @Test
    void patchQuantity_success() {
        Long poId = 1L;
        Long itemId = 2L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.DRAFT).build();
        PurchaseOrderItem entity = PurchaseOrderItem.builder().id(itemId).purchaseOrder(po).itemId(3L).quantity(5)
                .unitPrice(10.0).build();
        QuantityUpdateDTO patch = new QuantityUpdateDTO(7);
        when(itemRepo.findById(itemId)).thenReturn(Optional.of(entity));
        when(itemRepo.save(any())).thenReturn(entity);
        PurchaseOrderItemDTO result = service.patchQuantity(poId, itemId, patch);
        assertEquals(7, result.getQuantity());
    }

    @Test
    void listItems_poNotFound_throws() {
        Long poId = 1L;
        when(poRepo.findById(poId)).thenReturn(Optional.empty());
        Exception ex = assertThrows(IllegalArgumentException.class, () -> service.listItems(poId));
        assertTrue(ex.getMessage().contains("Purchase order not found"));
    }

    @Test
    void updateItem_itemNotFound_throws() {
        Long poId = 1L;
        Long itemId = 2L;
        when(itemRepo.findById(itemId)).thenReturn(Optional.empty());
        Exception ex = assertThrows(IllegalArgumentException.class,
                () -> service.updateItem(poId, itemId, PurchaseOrderItemDTO.builder().build()));
        assertTrue(ex.getMessage().contains("PO item not found"));
    }

    @Test
    void addItems_statusNotEditable_throws() {
        Long poId = 1L;
        PurchaseOrder po = PurchaseOrder.builder().poId(poId).status(PurchaseOrderStatus.RECEIVED).build();
        PurchaseOrderItemDTO dto = PurchaseOrderItemDTO.builder().itemId(3L).quantity(5).unitPrice(10.0).build();
        when(poRepo.findById(poId)).thenReturn(Optional.of(po));
        Exception ex = assertThrows(ResponseStatusException.class, () -> service.addItems(poId, List.of(dto)));
        assertTrue(ex.getMessage().contains("Items cannot be modified when order status is RECEIVED"));
    }
}
