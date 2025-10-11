package com.InventoryMangementSystem.inventoryservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = {
        com.InventoryMangementSystem.inventoryservice.config.TestConfig.class })
@AutoConfigureMockMvc
@ActiveProfiles("test-controller")
public class InventoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCheckAvailability() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("productId", 101);
        requestBody.put("quantity", 5);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/check-availability")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").exists())
                .andDo(print());
    }

    @Test
    public void testReserveBatch() throws Exception {
        Map<String, Object> items = new HashMap<>();
        items.put("101", 5);
        items.put("102", 3);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("items", items);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/reserve-batch")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").exists())
                .andDo(print());
    }

    @Test
    public void testConfirmAndCancelReservation() throws Exception {
        // First confirm a reservation
        Map<String, Object> confirmRequest = new HashMap<>();
        confirmRequest.put("reservationId", "test-reservation-123");

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/confirm")
                .content(objectMapper.writeValueAsString(confirmRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").exists())
                .andDo(print());

        // Then cancel a reservation
        Map<String, Object> cancelRequest = new HashMap<>();
        cancelRequest.put("reservationId", "test-reservation-456");

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/cancel")
                .content(objectMapper.writeValueAsString(cancelRequest))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").exists())
                .andDo(print());
    }
}
