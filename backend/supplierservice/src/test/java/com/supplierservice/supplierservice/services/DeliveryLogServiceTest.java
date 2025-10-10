
package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.DeliveryLogDTO;
import com.supplierservice.supplierservice.models.DeliveryLog;
import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.repository.DeliveryLogRepository;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeliveryLogServiceTest {

    @Mock
    private DeliveryLogRepository deliveryLogRepository;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @InjectMocks
    private DeliveryLogService deliveryLogService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void logDelivery_success() {
        DeliveryLogDTO dto = DeliveryLogDTO.builder()
                .poId(1L)
                .itemID(2L)
                .receivedQuantity(5)
                .receivedDate(LocalDate.now().toString())
                .build();
        PurchaseOrder order = PurchaseOrder.builder().poId(1L).build();
        DeliveryLog log = DeliveryLog.builder()
                .purchaseOrder(order)
                .itemId(2L)
                .receivedQuantity(5)
                .receivedDate(LocalDate.now())
                .build();
        DeliveryLog savedLog = DeliveryLog.builder().id(10L).purchaseOrder(order).itemId(2L).receivedQuantity(5)
                .receivedDate(LocalDate.now()).build();

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(deliveryLogRepository.save(any(DeliveryLog.class))).thenReturn(savedLog);

        DeliveryLog result = deliveryLogService.logDelivery(dto);
        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(deliveryLogRepository, times(1)).save(any(DeliveryLog.class));
    }

    @Test
    void logDelivery_missingPoId_throwsException() {
        DeliveryLogDTO dto = DeliveryLogDTO.builder()
                .poId(null)
                .itemID(2L)
                .receivedQuantity(5)
                .receivedDate(LocalDate.now().toString())
                .build();
        Exception ex = assertThrows(IllegalArgumentException.class, () -> deliveryLogService.logDelivery(dto));
        assertTrue(ex.getMessage().contains("Purchase Order ID cannot be null"));
        verifyNoInteractions(purchaseOrderRepository);
        verifyNoInteractions(deliveryLogRepository);
    }

    @Test
    void logDelivery_poNotFound_throwsException() {
        DeliveryLogDTO dto = DeliveryLogDTO.builder()
                .poId(99L)
                .itemID(2L)
                .receivedQuantity(5)
                .receivedDate(LocalDate.now().toString())
                .build();
        when(purchaseOrderRepository.findById(99L)).thenReturn(Optional.empty());
        Exception ex = assertThrows(RuntimeException.class, () -> deliveryLogService.logDelivery(dto));
        assertTrue(ex.getMessage().contains("Failed to log delivery"));
        verify(purchaseOrderRepository, times(1)).findById(99L);
        verifyNoInteractions(deliveryLogRepository);
    }

    @Test
    void getDeliveryLogsByPoId_returnsList() {
        List<DeliveryLog> logs = Arrays.asList(
                DeliveryLog.builder().id(1L).build(),
                DeliveryLog.builder().id(2L).build());
        when(deliveryLogRepository.findAllByPoId(1L)).thenReturn(logs);
        List<DeliveryLog> result = deliveryLogService.getDeliveryLogsByPoId(1L);
        assertEquals(2, result.size());
        verify(deliveryLogRepository, times(1)).findAllByPoId(1L);
    }

    @Test
    void getRecentDeliveryLogs_returnsList() {
        List<DeliveryLog> logs = Arrays.asList(
                DeliveryLog.builder().id(1L).build(),
                DeliveryLog.builder().id(2L).build());
        when(deliveryLogRepository.findTop10ByOrderByReceivedDateDesc()).thenReturn(logs);
        List<DeliveryLog> result = deliveryLogService.getRecentDeliveryLogs();
        assertEquals(2, result.size());
        verify(deliveryLogRepository, times(1)).findTop10ByOrderByReceivedDateDesc();
    }
}
