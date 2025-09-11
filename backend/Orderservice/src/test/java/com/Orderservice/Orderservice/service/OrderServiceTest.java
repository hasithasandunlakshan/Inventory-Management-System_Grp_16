package com.Orderservice.Orderservice.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import com.Orderservice.Orderservice.service.EventPublisherService;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {
    
    @Mock
    private OrderRepository orderRepository;
    
    @Mock  
    private ProductRepository productRepository;
    
    @Mock
    private EventPublisherService eventPublisherService;
    
    @InjectMocks
    private OrderService orderService;    private Order testOrder;
    private OrderItem testOrderItem;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Setup test data
        testProduct = new Product();
        testProduct.setProductId(1L);
        testProduct.setName("Test Product");
        testProduct.setImageUrl("http://test.com/image.jpg");
        testProduct.setBarcode("1234567890");

        testOrderItem = new OrderItem();
        testOrderItem.setOrderItemId(1L);
        testOrderItem.setProductId(1L);
        testOrderItem.setQuantity(2);
        testOrderItem.setPrice(BigDecimal.valueOf(25.99));


        testOrder = new Order();
        testOrder.setOrderId(1L);
        testOrder.setCustomerId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(OrderStatus.CONFIRMED);
        testOrder.setTotalAmount(BigDecimal.valueOf(51.98));

        testOrder.setOrderItems(Arrays.asList(testOrderItem));

        // Set up bidirectional relationship
        testOrderItem.setOrder(testOrder);
    }

    @Test
    void getAllOrdersByStatus_ShouldReturnOrdersSuccessfully() {
        // Arrange
        when(orderRepository.findByStatus(OrderStatus.CONFIRMED))
            .thenReturn(Arrays.asList(testOrder));
        when(productRepository.findById(1L))
            .thenReturn(Optional.of(testProduct));

        // Act
        AllOrdersResponse response = orderService.getAllOrdersByStatus("CONFIRMED");

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Orders retrieved successfully", response.getMessage());
        assertEquals(1, response.getTotalOrders());
        assertNotNull(response.getOrders());
        assertEquals(1, response.getOrders().size());
        assertEquals(testOrder.getOrderId(), response.getOrders().get(0).getOrderId());
        assertEquals(testOrder.getCustomerId(), response.getOrders().get(0).getCustomerId());
        
        verify(orderRepository, times(1)).findByStatus(OrderStatus.CONFIRMED);
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void getAllOrdersByStatus_WithNullStatus_ShouldReturnAllConfirmedOrders() {
        // Arrange
        when(orderRepository.findAllConfirmedOrdersWithItems())
            .thenReturn(Arrays.asList(testOrder));
        when(productRepository.findById(1L))
            .thenReturn(Optional.of(testProduct));

        // Act
        AllOrdersResponse response = orderService.getAllOrdersByStatus(null);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(1, response.getTotalOrders());
        
        verify(orderRepository, times(1)).findAllConfirmedOrdersWithItems();
        verify(orderRepository, never()).findByStatus(any());
    }

    @Test
    void getAllOrdersByStatus_WithEmptyStatus_ShouldReturnAllConfirmedOrders() {
        // Arrange
        when(orderRepository.findAllConfirmedOrdersWithItems())
            .thenReturn(Arrays.asList(testOrder));
        when(productRepository.findById(1L))
            .thenReturn(Optional.of(testProduct));

        // Act
        AllOrdersResponse response = orderService.getAllOrdersByStatus("");

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(1, response.getTotalOrders());
        
        verify(orderRepository, times(1)).findAllConfirmedOrdersWithItems();
        verify(orderRepository, never()).findByStatus(any());
    }

    @Test
    void getAllOrdersByStatus_WithProductNotFound_ShouldHandleGracefully() {
        // Arrange
        when(orderRepository.findByStatus(OrderStatus.CONFIRMED))
            .thenReturn(Arrays.asList(testOrder));
        when(productRepository.findById(1L))
            .thenReturn(Optional.empty());

        // Act
        AllOrdersResponse response = orderService.getAllOrdersByStatus("CONFIRMED");

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(1, response.getTotalOrders());
        assertEquals("Product Not Found", response.getOrders().get(0).getOrderItems().get(0).getProductName());
    }

    @Test
    void getAllOrdersByStatus_WithException_ShouldReturnErrorResponse() {
        // Arrange
        when(orderRepository.findByStatus(any()))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        AllOrdersResponse response = orderService.getAllOrdersByStatus("CONFIRMED");

        // Assert
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Error retrieving orders"));
        assertEquals(0, response.getTotalOrders());
        assertNotNull(response.getOrders());
        assertTrue(response.getOrders().isEmpty());
    }

    @Test
    void updateOrderStatus_WithValidOrder_ShouldUpdateSuccessfully() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        boolean result = orderService.updateOrderStatus(1L, "DELIVERED");

        // Assert
        assertTrue(result);
        assertEquals(OrderStatus.DELIVERED, testOrder.getStatus());
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void updateOrderStatus_WithInvalidOrder_ShouldReturnFalse() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        boolean result = orderService.updateOrderStatus(1L, "DELIVERED");

        // Assert
        assertFalse(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateOrderStatus_WithInvalidStatus_ShouldReturnFalse() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // Act
        boolean result = orderService.updateOrderStatus(1L, "INVALID_STATUS");

        // Assert
        assertFalse(result);
        verify(orderRepository, times(1)).findById(1L);
        verify(orderRepository, never()).save(any());
    }
}
