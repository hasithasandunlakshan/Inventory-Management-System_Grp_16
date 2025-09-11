package com.Orderservice.Orderservice.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.enums.OrderStatus;

@DataJpaTest
@ActiveProfiles("test")
public class OrderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OrderRepository orderRepository;

    private Order testOrder1;
    private Order testOrder2;
    private Order testOrder3;

    @BeforeEach
    void setUp() {
        // Create test orders with different statuses and customers
        
        OrderItem item1 = new OrderItem();
        item1.setProductId(1L);
        item1.setQuantity(2);
        item1.setPrice(BigDecimal.valueOf(25.99));


        testOrder1 = new Order();
        testOrder1.setCustomerId(1L);
        testOrder1.setOrderDate(LocalDateTime.now());
        testOrder1.setStatus(OrderStatus.CONFIRMED);
        testOrder1.setTotalAmount(BigDecimal.valueOf(51.98));

        testOrder1.setOrderItems(Arrays.asList(item1));
        item1.setOrder(testOrder1);

        OrderItem item2 = new OrderItem();
        item2.setProductId(2L);
        item2.setQuantity(1);
        item2.setPrice(BigDecimal.valueOf(15.50));


        testOrder2 = new Order();
        testOrder2.setCustomerId(1L);
        testOrder2.setOrderDate(LocalDateTime.now());
        testOrder2.setStatus(OrderStatus.DELIVERED);
        testOrder2.setTotalAmount(BigDecimal.valueOf(15.50));

        testOrder2.setOrderItems(Arrays.asList(item2));
        item2.setOrder(testOrder2);

        OrderItem item3 = new OrderItem();
        item3.setProductId(3L);
        item3.setQuantity(3);
        item3.setPrice(BigDecimal.valueOf(10.00));


        testOrder3 = new Order();
        testOrder3.setCustomerId(2L);
        testOrder3.setOrderDate(LocalDateTime.now());
        testOrder3.setStatus(OrderStatus.PENDING);
        testOrder3.setTotalAmount(BigDecimal.valueOf(30.00));

        testOrder3.setOrderItems(Arrays.asList(item3));
        item3.setOrder(testOrder3);

        // Persist test orders
        entityManager.persist(testOrder1);
        entityManager.persist(testOrder2);
        entityManager.persist(testOrder3);
        entityManager.flush();
    }

    @Test
    void findByCustomerId_ShouldReturnOrdersForSpecificCustomer() {
        // Act
        List<Order> customer1Orders = orderRepository.findByCustomerId(1L);
        List<Order> customer2Orders = orderRepository.findByCustomerId(2L);

        // Assert
        assertEquals(2, customer1Orders.size());
        assertEquals(1, customer2Orders.size());

        assertTrue(customer1Orders.contains(testOrder1));
        assertTrue(customer1Orders.contains(testOrder2));
        assertTrue(customer2Orders.contains(testOrder3));
    }

    @Test
    void findByCustomerId_WithNonExistentCustomer_ShouldReturnEmptyList() {
        // Act
        List<Order> orders = orderRepository.findByCustomerId(999L);

        // Assert
        assertTrue(orders.isEmpty());
    }

    @Test
    void findByStatus_ShouldReturnOrdersWithSpecificStatus() {
        // Act
        List<Order> confirmedOrders = orderRepository.findByStatus(OrderStatus.CONFIRMED);
        List<Order> deliveredOrders = orderRepository.findByStatus(OrderStatus.DELIVERED);
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING);

        // Assert
        assertEquals(1, confirmedOrders.size());
        assertEquals(1, deliveredOrders.size());
        assertEquals(1, pendingOrders.size());

        assertTrue(confirmedOrders.contains(testOrder1));
        assertTrue(deliveredOrders.contains(testOrder2));
        assertTrue(pendingOrders.contains(testOrder3));
    }

    @Test
    void findByStatus_WithNonExistentStatus_ShouldReturnEmptyList() {
        // Act
        List<Order> cancelledOrders = orderRepository.findByStatus(OrderStatus.CANCELLED);

        // Assert
        assertTrue(cancelledOrders.isEmpty());
    }

    @Test
    void findAllConfirmedOrdersWithItems_ShouldReturnOnlyConfirmedOrders() {
        // Act
        List<Order> confirmedOrdersWithItems = orderRepository.findAllConfirmedOrdersWithItems();

        // Assert
        assertEquals(1, confirmedOrdersWithItems.size());
        assertTrue(confirmedOrdersWithItems.contains(testOrder1));
        assertFalse(confirmedOrdersWithItems.contains(testOrder2)); // DELIVERED, not CONFIRMED
        assertFalse(confirmedOrdersWithItems.contains(testOrder3)); // PENDING, not CONFIRMED

        // Verify that order items are loaded (not lazy)
        Order confirmedOrder = confirmedOrdersWithItems.get(0);
        assertNotNull(confirmedOrder.getOrderItems());
        assertFalse(confirmedOrder.getOrderItems().isEmpty());
        assertEquals(1, confirmedOrder.getOrderItems().size());
    }

    @Test
    void findAll_ShouldReturnAllOrders() {
        // Act
        List<Order> allOrders = orderRepository.findAll();

        // Assert
        assertEquals(3, allOrders.size());
        assertTrue(allOrders.contains(testOrder1));
        assertTrue(allOrders.contains(testOrder2));
        assertTrue(allOrders.contains(testOrder3));
    }

    @Test
    void save_ShouldPersistOrderWithItems() {
        // Arrange
        OrderItem newItem = new OrderItem();
        newItem.setProductId(4L);
        newItem.setQuantity(1);
        newItem.setPrice(BigDecimal.valueOf(99.99));


        Order newOrder = new Order();
        newOrder.setCustomerId(3L);
        newOrder.setOrderDate(LocalDateTime.now());
        newOrder.setStatus(OrderStatus.CONFIRMED);
        newOrder.setTotalAmount(BigDecimal.valueOf(99.99));

        newOrder.setOrderItems(Arrays.asList(newItem));
        newItem.setOrder(newOrder);

        // Act
        Order savedOrder = orderRepository.save(newOrder);

        // Assert
        assertNotNull(savedOrder.getOrderId());
        assertEquals(3L, savedOrder.getCustomerId());
        assertEquals(OrderStatus.CONFIRMED, savedOrder.getStatus());
        assertEquals(1, savedOrder.getOrderItems().size());
        
        OrderItem savedItem = savedOrder.getOrderItems().get(0);
        assertNotNull(savedItem.getOrderItemId());
        assertEquals(4L, savedItem.getProductId());
        assertEquals(1, savedItem.getQuantity());
        assertEquals(savedOrder, savedItem.getOrder());
    }

    @Test
    void delete_ShouldRemoveOrderAndItems() {
        // Arrange
        Long orderIdToDelete = testOrder1.getOrderId();

        // Act
        orderRepository.delete(testOrder1);
        entityManager.flush();

        // Assert
        assertFalse(orderRepository.findById(orderIdToDelete).isPresent());
        
        // Verify total count is reduced
        List<Order> allOrders = orderRepository.findAll();
        assertEquals(2, allOrders.size());
        assertFalse(allOrders.contains(testOrder1));
    }

    @Test
    void findByCustomerIdWithOrderItems_ShouldReturnOrdersWithItems() {
        // Act
        List<Order> customer1Orders = orderRepository.findByCustomerIdWithOrderItems(1L);
        List<Order> customer2Orders = orderRepository.findByCustomerIdWithOrderItems(2L);

        // Assert
        assertEquals(2, customer1Orders.size());
        assertEquals(1, customer2Orders.size());

        assertTrue(customer1Orders.contains(testOrder1));
        assertTrue(customer1Orders.contains(testOrder2));
        assertTrue(customer2Orders.contains(testOrder3));

        // Verify that order items are loaded
        for (Order order : customer1Orders) {
            assertNotNull(order.getOrderItems());
            assertFalse(order.getOrderItems().isEmpty());
        }
    }
}
