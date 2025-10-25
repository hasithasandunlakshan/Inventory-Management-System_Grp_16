package com.InventoryMangementSystem.inventoryservice.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Basic integration test for Inventory Service.
 * This test focuses on the API endpoints without complex setup.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SimpleInventoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Simple test to verify that the service is up and running
     * by checking that the context loads correctly.
     */
    @Test
    void contextLoads() {
        // This test will pass if the Spring context loads successfully
    }

    /**
     * Test that the inventory endpoint returns a valid response.
     * This is a simplified test that just verifies the endpoint is accessible.
     */
    @Test
    void testGetInventory() throws Exception {
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk());
    }

    /**
     * Test a basic JSON payload with the inventory service.
     * This is a simplified example of checking inventory availability.
     */
    @Test
    void testBasicJsonPayload() throws Exception {
        // Create a simple JSON request
        String jsonRequest = "{\"productId\": 1, \"quantity\": 10}";

        mockMvc.perform(post("/api/inventory/check-availability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andExpect(status().isOk());
    }
}
