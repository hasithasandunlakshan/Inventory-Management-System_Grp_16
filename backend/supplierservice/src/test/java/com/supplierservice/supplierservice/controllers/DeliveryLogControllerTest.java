package com.supplierservice.supplierservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.supplierservice.supplierservice.dto.DeliveryLogDTO;
import com.supplierservice.supplierservice.models.DeliveryLog;
import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.services.DeliveryLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import java.util.List;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DeliveryLogControllerTest {

    private MockMvc mockMvc;
    @Mock
    private DeliveryLogService deliveryLogService;
    @InjectMocks
    private DeliveryLogController controller;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Configure ObjectMapper
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Configure message converter
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(objectMapper);
        converter.setSupportedMediaTypes(List.of(MediaType.APPLICATION_JSON));

        // Setup MockMvc
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void logDelivery_success() throws Exception {
        // Prepare test data
        DeliveryLogDTO dto = DeliveryLogDTO.builder()
                .poId(1L)
                .itemID(2L)
                .receivedQuantity(5)
                .receivedDate("2025-10-10")
                .build();

        PurchaseOrder po = PurchaseOrder.builder()
                .poId(1L)
                .build();

        DeliveryLog log = DeliveryLog.builder()
                .id(10L)
                .purchaseOrder(po)
                .itemId(2L)
                .receivedQuantity(5)
                .receivedDate(LocalDate.parse("2025-10-10"))
                .build();

        // Mock service call
        when(deliveryLogService.logDelivery(any(DeliveryLogDTO.class))).thenReturn(log);

        // Execute test and verify response
        String requestJson = objectMapper.writeValueAsString(dto);
        System.out.println("Request JSON in success test: " + requestJson);

        mockMvc.perform(post("/api/delivery-logs/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andExpect(jsonPath("$.data.id", is(10)))
                .andExpect(jsonPath("$.data.itemId", is(2)));

        // Verify service was called
        verify(deliveryLogService).logDelivery(any(DeliveryLogDTO.class));
    }

    @Test
    void logDelivery_failure() throws Exception {
        // Prepare test data with LocalDate
        String receivedDate = "2025-10-10";
        DeliveryLogDTO dto = DeliveryLogDTO.builder()
                .poId(1L)
                .itemID(2L)
                .receivedQuantity(5)
                .receivedDate(receivedDate)
                .build();

        // Mock service to throw exception
        when(deliveryLogService.logDelivery(any(DeliveryLogDTO.class)))
                .thenThrow(new RuntimeException("Some error"));

        // Execute test and verify response
        String requestJson = objectMapper.writeValueAsString(dto);
        System.out.println("Request JSON in failure test: " + requestJson);

        mockMvc.perform(post("/api/delivery-logs/log")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Failed to log delivery")))
                .andExpect(jsonPath("$.data").doesNotExist());

        // Verify service was called
        verify(deliveryLogService).logDelivery(any(DeliveryLogDTO.class));
    }

    @Test
    void getDeliveryLogs_success() throws Exception {
        DeliveryLog log = DeliveryLog.builder().id(10L).itemId(2L).build();
        when(deliveryLogService.getDeliveryLogsByPoId(1L)).thenReturn(List.of(log));
        mockMvc.perform(get("/api/delivery-logs?purchaseOrderId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(10)))
                .andExpect(jsonPath("$[0].itemId", is(2)));
    }

    @Test
    void getRecentDeliveryLogs_success() throws Exception {
        DeliveryLog log = DeliveryLog.builder().id(10L).itemId(2L).build();
        when(deliveryLogService.getRecentDeliveryLogs()).thenReturn(List.of(log));
        mockMvc.perform(get("/api/delivery-logs/recent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(10)))
                .andExpect(jsonPath("$[0].itemId", is(2)));
    }
}
