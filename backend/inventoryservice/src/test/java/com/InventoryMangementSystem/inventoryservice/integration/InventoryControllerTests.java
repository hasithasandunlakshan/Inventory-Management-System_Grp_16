package com.InventoryMangementSystem.inventoryservice.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Integration test for Inventory Service
 * Using mock MVC to test the controller endpoints
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class InventoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long testProductId = 123L;

    @Test
    public void testGetInventory() throws Exception {
        mockMvc.perform(get("/api/inventory/{productId}", testProductId))
                .andExpect(status().isOk());
    }

    @Test
    public void testAdjustInventory() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/adjust", testProductId)
                .param("delta", "20"))
                .andExpect(status().isOk());
    }

    @Test
    public void testReserveInventory() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/reserve", testProductId)
                .param("quantity", "30"))
                .andExpect(status().isOk());
    }

    @Test
    public void testUpdateThreshold() throws Exception {
        mockMvc.perform(post("/api/inventory/{productId}/threshold", testProductId)
                .param("value", "20"))
                .andExpect(status().isOk());
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
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testReserveBatch() throws Exception {
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("productId", testProductId);
        requestMap.put("quantity", 50);

        mockMvc.perform(post("/api/inventory/reserve-batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testConfirmReservation() throws Exception {
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("productId", testProductId);
        requestMap.put("quantity", 20);

        mockMvc.perform(post("/api/inventory/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testCancelReservation() throws Exception {
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("productId", testProductId);
        requestMap.put("quantity", 20);

        mockMvc.perform(post("/api/inventory/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestMap)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testListAllInventory() throws Exception {
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk());
    }
}
