package com.InventoryMangementSystem.inventoryservice.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.InventoryMangementSystem.inventoryservice.config.IntegrationTestConfig;
import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.repository.InventoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Integration test for the Inventory Service
 * Tests interactions between the inventory controller, service, and repository
 * layers
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(IntegrationTestConfig.class)
@Transactional
public class InventoryServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long testProductId = 123L;
    private Inventory testInventory;

    @BeforeEach
    void setUp() {
        // Clean up the database
        inventoryRepository.deleteAll();

        // Create inventory for the product using the main model structure
        testInventory = Inventory.builder()
                .productId(testProductId)
                .stock(100)
                .reserved(0)
                .availableStock(100)
                .minThreshold(20)
                .build();

        // Save the inventory to the database
        testInventory = inventoryRepository.save(testInventory);
    }

    @Test
    public void testGetInventoryByProductId() throws Exception {
        // Get the inventory using the API
        mockMvc.perform(get("/api/inventory/{productId}", testProductId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(testProductId))
                .andExpect(jsonPath("$.stock").value(100))
                .andExpect(jsonPath("$.reserved").value(0))
                .andExpect(jsonPath("$.availableStock").value(100));
    }

    @Test
    public void testAdjustInventory() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/adjust", testProductId)
                .param("delta", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(120));

        // Verify the database was updated
        Optional<Inventory> updated = inventoryRepository.findByProductId(testProductId);
        assertTrue(updated.isPresent());
        assertEquals(120, updated.get().getStock());
    }

    @Test
    public void testReserveInventory() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/reserve", testProductId)
                .param("quantity", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reserved").value(30));

        // Verify the database was updated
        Optional<Inventory> updated = inventoryRepository.findByProductId(testProductId);
        assertTrue(updated.isPresent());
        assertEquals(30, updated.get().getReserved());
        assertEquals(70, updated.get().getAvailableStock());
    }

    @Test
    public void testUpdateThreshold() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/threshold", testProductId)
                .param("value", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minThreshold").value(25));

        // Verify the database was updated
        Inventory updated = inventoryRepository.findByProductId(testProductId).orElseThrow();
        assertEquals(25, updated.getMinThreshold());
    }

    @Test
    public void testCheckAvailability() throws Exception {
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("productId", testProductId);
        requestMap.put("quantity", 50);

        mockMvc.perform(post("/api/inventory/check-availability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Products available"));
    }

    @Test
    public void testReserveBatch() throws Exception {
        Map<String, Object> itemsMap = new HashMap<>();
        itemsMap.put(testProductId.toString(), 50);

        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("items", itemsMap);

        mockMvc.perform(post("/api/inventory/reserve-batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Inventory reserved successfully"));

        // Verify reservation was successful
        Inventory updated = inventoryRepository.findByProductId(testProductId).orElseThrow();
        assertEquals(50, updated.getReserved());
    }

    @Test
    public void testConfirmReservation() throws Exception {
        // First reserve some inventory
        testInventory.setReserved(20);
        testInventory.setAvailableStock(testInventory.getStock() - testInventory.getReserved());
        inventoryRepository.save(testInventory);

        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("reservationId", "test-res-123");

        mockMvc.perform(post("/api/inventory/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    public void testCancelReservation() throws Exception {
        // First reserve some inventory
        testInventory.setReserved(20);
        testInventory.setAvailableStock(testInventory.getStock() - testInventory.getReserved());
        inventoryRepository.save(testInventory);

        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("reservationId", "test-res-123");

        mockMvc.perform(post("/api/inventory/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    public void testListAllInventory() throws Exception {
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].inventoryId").exists())
                .andExpect(jsonPath("$[0].productId").value(testProductId));
    }
}
