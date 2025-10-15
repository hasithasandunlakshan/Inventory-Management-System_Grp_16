package com.Orderservice.Orderservice.service;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

/**
 * Performance test for the optimized getOrdersByCustomerId method
 * This test verifies that the bulk fetching optimization reduces database calls
 */
@ExtendWith(MockitoExtension.class)
public class OrderServicePerformanceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private Long customerId;
    private List<Order> mockOrders;
    private List<Product> mockProducts;

    @BeforeEach
    void setUp() {
        customerId = 1L;

        // Create mock products
        Product product1 = new Product();
        product1.setProductId(101L);
        product1.setName("Product 1");
        product1.setImageUrl("http://example.com/image1.jpg");
        product1.setBarcode("BARCODE1");

        Product product2 = new Product();
        product2.setProductId(102L);
        product2.setName("Product 2");
        product2.setImageUrl("http://example.com/image2.jpg");
        product2.setBarcode("BARCODE2");

        mockProducts = Arrays.asList(product1, product2);

        // Create mock order items
        OrderItem item1 = new OrderItem();
        item1.setOrderItemId(1L);
        item1.setProductId(101L);
        item1.setQuantity(2);
        item1.setPrice(new BigDecimal("19.99"));

        OrderItem item2 = new OrderItem();
        item2.setOrderItemId(2L);
        item2.setProductId(102L);
        item2.setQuantity(1);
        item2.setPrice(new BigDecimal("29.99"));

        OrderItem item3 = new OrderItem();
        item3.setOrderItemId(3L);
        item3.setProductId(101L);
        item3.setQuantity(3);
        item3.setPrice(new BigDecimal("19.99"));

        // Create mock orders
        Order order1 = new Order();
        order1.setOrderId(1L);
        order1.setCustomerId(customerId);
        order1.setStatus(com.Orderservice.Orderservice.enums.OrderStatus.CONFIRMED);
        order1.setTotalAmount(new BigDecimal("69.97"));
        order1.setOrderItems(Arrays.asList(item1, item2));

        Order order2 = new Order();
        order2.setOrderId(2L);
        order2.setCustomerId(customerId);
        order2.setStatus(com.Orderservice.Orderservice.enums.OrderStatus.CONFIRMED);
        order2.setTotalAmount(new BigDecimal("59.97"));
        order2.setOrderItems(Arrays.asList(item3));

        mockOrders = Arrays.asList(order1, order2);
    }

    @Test
    void testGetOrdersByCustomerId_BulkFetchingOptimization() {
        // Arrange
        when(orderRepository.findByCustomerIdWithOrderItems(customerId))
                .thenReturn(mockOrders);
        when(productRepository.findByProductIdIn(anySet()))
                .thenReturn(mockProducts);

        // Act
        AllOrdersResponse response = orderService.getOrdersByCustomerId(customerId);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(2, response.getTotalOrders());
        assertNotNull(response.getOrders());

        // CRITICAL ASSERTION: Verify that findByProductIdIn was called ONLY ONCE
        // This proves the optimization is working - all products fetched in one query
        verify(productRepository, times(1)).findByProductIdIn(anySet());
        
        // Verify that findById was NEVER called (old inefficient way)
        verify(productRepository, never()).findById(any());

        // Verify repository calls
        verify(orderRepository, times(1)).findByCustomerIdWithOrderItems(customerId);
    }

    @Test
    void testGetOrdersByCustomerId_EmptyOrders() {
        // Arrange
        when(orderRepository.findByCustomerIdWithOrderItems(customerId))
                .thenReturn(Arrays.asList());

        // Act
        AllOrdersResponse response = orderService.getOrdersByCustomerId(customerId);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(0, response.getTotalOrders());
        assertEquals("No orders found for customer", response.getMessage());

        // Verify that product repository was never called (no products to fetch)
        verify(productRepository, never()).findByProductIdIn(anySet());
    }

    @Test
    void testGetOrdersByCustomerId_PerformanceWithManyOrderItems() {
        // Arrange - Simulate a user with many orders and items
        int orderCount = 10;
        int itemsPerOrder = 5;
        // Total items = 50, but only 2 unique products

        List<Order> manyOrders = new java.util.ArrayList<>();
        for (int i = 0; i < orderCount; i++) {
            Order order = new Order();
            order.setOrderId((long) i);
            order.setCustomerId(customerId);
            order.setStatus(com.Orderservice.Orderservice.enums.OrderStatus.CONFIRMED);
            order.setTotalAmount(new BigDecimal("99.95"));

            List<OrderItem> items = new java.util.ArrayList<>();
            for (int j = 0; j < itemsPerOrder; j++) {
                OrderItem item = new OrderItem();
                item.setOrderItemId((long) (i * itemsPerOrder + j));
                item.setProductId(101L + (j % 2)); // Alternates between 101 and 102
                item.setQuantity(1);
                item.setPrice(new BigDecimal("19.99"));
                items.add(item);
            }
            order.setOrderItems(items);
            manyOrders.add(order);
        }

        when(orderRepository.findByCustomerIdWithOrderItems(customerId))
                .thenReturn(manyOrders);
        when(productRepository.findByProductIdIn(anySet()))
                .thenReturn(mockProducts);

        // Act
        long startTime = System.currentTimeMillis();
        AllOrdersResponse response = orderService.getOrdersByCustomerId(customerId);
        long endTime = System.currentTimeMillis();

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(orderCount, response.getTotalOrders());

        // CRITICAL: Even with 50 order items, only ONE call to fetch products
        verify(productRepository, times(1)).findByProductIdIn(anySet());
        verify(productRepository, never()).findById(any());

        System.out.println("Fetched " + orderCount + " orders with " + 
                          (orderCount * itemsPerOrder) + " items in " + 
                          (endTime - startTime) + "ms");
        System.out.println("Product repository called only ONCE for bulk fetch!");
    }
}
