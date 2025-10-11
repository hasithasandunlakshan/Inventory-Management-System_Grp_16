package com.InventoryMangementSystem.inventoryservice.integration;

import com.InventoryMangementSystem.inventoryservice.controller.InventoryController;
import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.repository.InventoryRepository;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test for the InventoryController using MockMvc
 */
@WebMvcTest(InventoryController.class)
public class InventoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @Autowired
    private ObjectMapper objectMapper;

    private Inventory testInventory;
    private Long testProductId = 123L;

    @BeforeEach
    void setUp() {
        // Create test inventory object
        testInventory = Inventory.builder()
                .inventoryId(1L)
                .productId(testProductId)
                .stock(100)
                .reserved(0)
                .availableStock(100)
                .minThreshold(10)
                .version(0L)
                .build();
    }

    @Test
    public void testGetInventoryByProductId() throws Exception {
        // Mock service behavior
        when(inventoryService.getOrCreateByProductId(testProductId)).thenReturn(testInventory);

        // Perform GET request and verify response
        mockMvc.perform(get("/api/inventory/{productId}", testProductId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(testProductId))
                .andExpect(jsonPath("$.stock").value(100))
                .andExpect(jsonPath("$.availableStock").value(100));

        verify(inventoryService).getOrCreateByProductId(testProductId);
    }

    @Test
    public void testAdjustInventory() throws Exception {
        // Mock service behavior
        Inventory adjustedInventory = Inventory.builder()
                .inventoryId(1L)
                .productId(testProductId)
                .stock(120)
                .reserved(0)
                .availableStock(120)
                .minThreshold(10)
                .version(1L)
                .build();
        when(inventoryService.adjustStock(testProductId, 20)).thenReturn(adjustedInventory);

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/{productId}/adjust", testProductId)
                .param("delta", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(120))
                .andExpect(jsonPath("$.availableStock").value(120));

        verify(inventoryService).adjustStock(testProductId, 20);
    }

    @Test
    public void testReserveInventory() throws Exception {
        // Mock service behavior
        Inventory reservedInventory = Inventory.builder()
                .inventoryId(1L)
                .productId(testProductId)
                .stock(100)
                .reserved(30)
                .availableStock(70)
                .minThreshold(10)
                .version(1L)
                .build();
        when(inventoryService.reserveStock(testProductId, 30)).thenReturn(reservedInventory);

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/{productId}/reserve", testProductId)
                .param("quantity", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reserved").value(30))
                .andExpect(jsonPath("$.availableStock").value(70));

        verify(inventoryService).reserveStock(testProductId, 30);
    }

    @Test
    public void testUpdateThreshold() throws Exception {
        // Mock service behavior
        Inventory updatedInventory = Inventory.builder()
                .inventoryId(1L)
                .productId(testProductId)
                .stock(100)
                .reserved(0)
                .availableStock(100)
                .minThreshold(25)
                .version(1L)
                .build();
        when(inventoryService.updateThreshold(testProductId, 25)).thenReturn(updatedInventory);

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/{productId}/threshold", testProductId)
                .param("value", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minThreshold").value(25));

        verify(inventoryService).updateThreshold(testProductId, 25);
    }

    @Test
    public void testCheckAvailability() throws Exception {
        // Create request map
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("productId", testProductId);
        requestMap.put("quantity", 50);

        // For these batch operations, controller returns hardcoded responses
        // and doesn't use the service directly

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/check-availability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Products available"));

        // No service call verification needed since the controller doesn't use the
        // service
    }

    @Test
    public void testReserveBatch() throws Exception {
        // Create request map
        Map<String, Object> requestMap = new HashMap<>();
        Map<String, Integer> itemMap = new HashMap<>();
        itemMap.put(testProductId.toString(), 50);
        requestMap.put("items", itemMap);

        // For these batch operations, controller returns hardcoded responses
        // and doesn't use the service directly

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/reserve-batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Inventory reserved successfully"));

        // No service call verification needed since the controller doesn't use the
        // service
    }

    @Test
    public void testConfirmReservation() throws Exception {
        // Create request map
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("reservationId", "test-res-123");

        // For these batch operations, controller returns hardcoded responses
        // and doesn't use the service directly

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());

        // No service call verification needed since the controller doesn't use the
        // service
    }

    @Test
    public void testCancelReservation() throws Exception {
        // Create request map
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("reservationId", "test-res-123");

        // For these batch operations, controller returns hardcoded responses
        // and doesn't use the service directly

        // Perform POST request and verify response
        mockMvc.perform(post("/api/inventory/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());

        // No service call verification needed since the controller doesn't use the
        // service
    }

    @Test
    public void testListAllInventory() throws Exception {
        // Mock service behavior
        when(inventoryService.listAll()).thenReturn(Arrays.asList(testInventory));

        // Perform GET request and verify response
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].inventoryId").exists())
                .andExpect(jsonPath("$[0].productId").value(testProductId));

        verify(inventoryService).listAll();
    }
}
