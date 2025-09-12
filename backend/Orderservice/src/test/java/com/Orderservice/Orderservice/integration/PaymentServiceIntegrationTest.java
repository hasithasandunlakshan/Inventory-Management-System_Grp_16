package com.Orderservice.Orderservice.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.context.annotation.Import;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.Orderservice.Orderservice.config.IntegrationTestConfig;
import com.Orderservice.Orderservice.dto.PaymentConfirmationRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Payment;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.PaymentRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import com.Orderservice.Orderservice.service.PaymentService;

@SpringBootTest
@AutoConfigureTestEntityManager
@ActiveProfiles("integration")
@Import(IntegrationTestConfig.class)
@Transactional
public class PaymentServiceIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct;
    private Order testOrder;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        // Create test product
        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setPrice(BigDecimal.valueOf(25.99));
        testProduct.setStockQuantity(10);
        testProduct.setBarcode("1234567890");
        testProduct.setImageUrl("http://test.com/image.jpg");
        testProduct = productRepository.save(testProduct);

        // Create test order item
        OrderItem testOrderItem = new OrderItem();
        testOrderItem.setProductId(testProduct.getProductId());
        testOrderItem.setQuantity(2);
        testOrderItem.setPrice(BigDecimal.valueOf(25.99));

        // Create test order
        testOrder = new Order();
        testOrder.setCustomerId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setTotalAmount(BigDecimal.valueOf(51.98));
        testOrder.setOrderItems(Arrays.asList(testOrderItem));
        
        // Set bidirectional relationship
        testOrderItem.setOrder(testOrder);
        
        testOrder = orderRepository.save(testOrder);

        // Create test payment
        testPayment = new Payment();
        testPayment.setOrder(testOrder);
        testPayment.setStripePaymentIntentId("pi_test123");
        testPayment.setAmount(BigDecimal.valueOf(51.98));
        testPayment.setCurrency("usd");
        testPayment.setStatus(PaymentStatus.PENDING);
        testPayment = paymentRepository.save(testPayment);
    }

    @Test
    void confirmPayment_WithValidData_ShouldConfirmSuccessfully() {
        // Arrange
        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(testOrder.getOrderId());
        request.setPaymentIntentId("pi_test123");

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Payment confirmed and order updated successfully", response.getMessage());

        // Verify database changes
        Order updatedOrder = orderRepository.findById(testOrder.getOrderId()).orElse(null);
        assertNotNull(updatedOrder);
        assertEquals(OrderStatus.CONFIRMED, updatedOrder.getStatus());

        List<Payment> updatedPayments = paymentRepository.findByOrderOrderId(updatedOrder.getOrderId());
        assertFalse(updatedPayments.isEmpty());
        Payment updatedPayment = updatedPayments.get(0);
        assertEquals(PaymentStatus.PAID, updatedPayment.getStatus());
        assertNotNull(updatedPayment.getUpdatedAt());
    }

    @Test
    void confirmPayment_WithInvalidOrderId_ShouldFail() {
        // Arrange
        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(999L); // Non-existent order ID
        request.setPaymentIntentId("pi_test123");

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Order not found", response.getMessage());

        // Verify no changes in database
        Order originalOrder = orderRepository.findById(testOrder.getOrderId()).orElse(null);
        assertNotNull(originalOrder);
        assertEquals(OrderStatus.PENDING, originalOrder.getStatus());

        List<Payment> originalPayments = paymentRepository.findByOrderOrderId(originalOrder.getOrderId());
        assertFalse(originalPayments.isEmpty());
        Payment originalPayment = originalPayments.get(0);
        assertEquals(PaymentStatus.PENDING, originalPayment.getStatus());
    }

    @Test
    void confirmPayment_WithWrongPaymentIntentId_ShouldFail() {
        // Arrange
        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(testOrder.getOrderId());
        request.setPaymentIntentId("pi_wrong123"); // Wrong payment intent ID

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment intent ID mismatch", response.getMessage());

        // Verify no changes in database
        Order originalOrder = orderRepository.findById(testOrder.getOrderId()).orElse(null);
        assertNotNull(originalOrder);
        assertEquals(OrderStatus.PENDING, originalOrder.getStatus());

        List<Payment> originalPayments = paymentRepository.findByOrderOrderId(originalOrder.getOrderId());
        assertFalse(originalPayments.isEmpty());
        Payment originalPayment = originalPayments.get(0);
        assertEquals(PaymentStatus.PENDING, originalPayment.getStatus());
    }

    @Test
    void confirmPayment_WithAlreadyConfirmedOrder_ShouldFail() {
        // Arrange
        testOrder.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(testOrder);

        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(testOrder.getOrderId());
        request.setPaymentIntentId("pi_test123");

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Order is already confirmed", response.getMessage());
    }

    @Test
    void confirmPayment_WithAlreadyCompletedPayment_ShouldFail() {
        // Arrange
        testPayment.setStatus(PaymentStatus.PAID);
        paymentRepository.save(testPayment);

        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(testOrder.getOrderId());
        request.setPaymentIntentId("pi_test123");

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment is already paid", response.getMessage());
    }

    @Test
    void confirmPayment_ShouldPersistDataCorrectly() {
        // Arrange
        PaymentConfirmationRequest request = new PaymentConfirmationRequest();
        request.setOrderId(testOrder.getOrderId());
        request.setPaymentIntentId("pi_test123");

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        // Assert
        assertTrue(response.isSuccess());

        // Verify all entities are properly persisted
        Order persistedOrder = orderRepository.findById(testOrder.getOrderId()).orElse(null);
        assertNotNull(persistedOrder);
        assertEquals(OrderStatus.CONFIRMED, persistedOrder.getStatus());
        assertNotNull(persistedOrder.getUpdatedAt());

        List<Payment> persistedPayments = paymentRepository.findByOrderOrderId(persistedOrder.getOrderId());
        assertFalse(persistedPayments.isEmpty());
        Payment persistedPayment = persistedPayments.get(0);
        assertEquals(PaymentStatus.PAID, persistedPayment.getStatus());
        assertEquals("pi_test123", persistedPayment.getStripePaymentIntentId());
        assertNotNull(persistedPayment.getUpdatedAt());

        // Verify order items are still associated correctly
        assertNotNull(persistedOrder.getOrderItems());
        assertEquals(1, persistedOrder.getOrderItems().size());
        OrderItem persistedItem = persistedOrder.getOrderItems().get(0);
        assertEquals(testProduct.getProductId(), persistedItem.getProductId());
        assertEquals(2, persistedItem.getQuantity());
    }
}