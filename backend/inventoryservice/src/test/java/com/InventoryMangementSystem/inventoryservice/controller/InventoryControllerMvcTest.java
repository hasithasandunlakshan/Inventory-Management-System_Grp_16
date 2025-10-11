package com.InventoryMangementSystem.inventoryservice.controller;

import com.InventoryMangementSystem.inventoryservice.models.Inventory;
import com.InventoryMangementSystem.inventoryservice.services.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(InventoryController.class)
public class InventoryControllerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @Autowired
    private ObjectMapper objectMapper;

    private Inventory testInventory;
    private List<Inventory> inventoryList;

    @BeforeEach
    void setUp() {
        // Create test data
        testInventory = Inventory.builder()
                .inventoryId(1L)
                .productId(101L)
                .stock(100)
                .reserved(10)
                .availableStock(90)
                .minThreshold(20)
                .version(1L)
                .build();

        inventoryList = Arrays.asList(testInventory);
    }

    @Test
    public void testListAll() throws Exception {
        when(inventoryService.listAll()).thenReturn(inventoryList);

        mockMvc.perform(MockMvcRequestBuilders
                .get("/api/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].productId").value(101))
                .andDo(print());
    }

    @Test
    public void testGetByProduct() throws Exception {
        when(inventoryService.getOrCreateByProductId(anyLong())).thenReturn(testInventory);

        mockMvc.perform(MockMvcRequestBuilders
                .get("/api/inventory/101")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.productId").value(101))
                .andDo(print());
    }

    @Test
    public void testAdjust() throws Exception {
        when(inventoryService.adjustStock(anyLong(), anyInt())).thenReturn(testInventory);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/101/adjust?delta=20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.productId").value(101))
                .andDo(print());
    }

    @Test
    public void testReserve() throws Exception {
        when(inventoryService.reserveStock(anyLong(), anyInt())).thenReturn(testInventory);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/101/reserve?quantity=5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.productId").value(101))
                .andDo(print());
    }

    @Test
    public void testReserveBatch() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("items", Map.of(
                "101", 5,
                "102", 3));

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);
        responseData.put("message", "Inventory reserved successfully");

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/reserve-batch")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andDo(print());
    }

    @Test
    public void testConfirmReservation() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("reservationId", "res-123");

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/confirm")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andDo(print());
    }

    @Test
    public void testCancelReservation() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("reservationId", "res-123");

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/cancel")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andDo(print());
    }

    @Test
    public void testCheckAvailability() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("productId", 101L);
        requestBody.put("quantity", 5);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/check-availability")
                .content(objectMapper.writeValueAsString(requestBody))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andDo(print());
    }

    @Test
    public void testUpdateThreshold() throws Exception {
        when(inventoryService.updateThreshold(anyLong(), anyInt())).thenReturn(testInventory);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/inventory/101/threshold?value=25")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.productId").value(101))
                .andDo(print());
    }
}
