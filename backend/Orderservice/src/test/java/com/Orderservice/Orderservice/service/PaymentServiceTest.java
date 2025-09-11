package com.Orderservice.Orderservice.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.Orderservice.Orderservice.dto.CreatePaymentIntentRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationResponse;
import com.Orderservice.Orderservice.entity.Invoice;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Payment;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import com.Orderservice.Orderservice.repository.InvoiceRepository;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.PaymentRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private EventPublisherService eventPublisherService;

    @InjectMocks
    private PaymentService paymentService;

    private CreatePaymentIntentRequest createPaymentIntentRequest;
    private PaymentConfirmationRequest paymentConfirmationRequest;
    private Order testOrder;
    private Payment testPayment;
    private Product testProduct;
    private OrderItem testOrderItem;
    private Invoice testInvoice;

    @BeforeEach
    void setUp() {
        // Setup test data
        testProduct = new Product();
        testProduct.setProductId(1L);
        testProduct.setName("Test Product");
        testProduct.setPrice(BigDecimal.valueOf(25.99));
        testProduct.setStockQuantity(10);
        testProduct.setBarcode("1234567890");

        testOrderItem = new OrderItem();
        testOrderItem.setProductId(1L);
        testOrderItem.setQuantity(2);
        testOrderItem.setPrice(BigDecimal.valueOf(25.99));

        testOrder = new Order();
        testOrder.setOrderId(1L);
        testOrder.setCustomerId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setTotalAmount(BigDecimal.valueOf(51.98));
        testOrder.setOrderItems(Arrays.asList(testOrderItem));

        testPayment = new Payment();
        testPayment.setPaymentId(1L);
        testPayment.setOrder(testOrder);
        testPayment.setStripePaymentIntentId("pi_test123");
        testPayment.setAmount(BigDecimal.valueOf(51.98));
        testPayment.setCurrency("usd");
        testPayment.setStatus(PaymentStatus.PENDING);

        // Create order item using constructor or setters instead of builder pattern
        CreatePaymentIntentRequest.OrderItem cartItem = new CreatePaymentIntentRequest.OrderItem();
        cartItem.setProductId(1L);
        cartItem.setQuantity(2);
        cartItem.setUnitPrice(BigDecimal.valueOf(25.99));

        // Create payment intent request using constructor and setters
        createPaymentIntentRequest = new CreatePaymentIntentRequest();
        createPaymentIntentRequest.setCustomerId(1L);
        createPaymentIntentRequest.setAmount(5198L); // $51.98 in cents
        createPaymentIntentRequest.setCurrency("usd");
        createPaymentIntentRequest.setOrderItems(Arrays.asList(cartItem));

        // Create payment confirmation request using constructor and setters
        paymentConfirmationRequest = new PaymentConfirmationRequest();
        paymentConfirmationRequest.setOrderId(1L);
        paymentConfirmationRequest.setPaymentIntentId("pi_test123");

        // Create test invoice
        testInvoice = new Invoice();
        testInvoice.setInvoiceId(1L);
        testInvoice.setOrder(testOrder);
        testInvoice.setPaymentStatus(PaymentStatus.PENDING);
        testInvoice.setAmount(BigDecimal.valueOf(51.98));
    }

    @Test
    void confirmPayment_WithValidOrder_ShouldConfirmSuccessfully() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByStripePaymentIntentId("pi_test123")).thenReturn(Optional.of(testPayment));
        when(invoiceRepository.findByOrder(testOrder)).thenReturn(Optional.of(testInvoice));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(testInvoice);

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Payment confirmed successfully", response.getMessage());
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
        assertEquals(PaymentStatus.PAID, testPayment.getStatus());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).findByStripePaymentIntentId("pi_test123");
        verify(orderRepository, times(1)).save(testOrder);
        verify(paymentRepository, times(1)).save(testPayment);
        verify(eventPublisherService, times(1)).publishInventoryReservationRequest(eq(1L), eq(1L), anyList());
    }

    @Test
    void confirmPayment_WithInvalidOrder_ShouldReturnError() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Order not found", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, never()).findByStripePaymentIntentId(anyString());
        verify(eventPublisherService, never()).publishInventoryReservationRequest(anyLong(), anyLong(), anyList());
    }

    @Test
    void confirmPayment_WithMissingPayment_ShouldReturnError() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByStripePaymentIntentId("pi_test123")).thenReturn(Optional.empty());

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Payment intent ID mismatch", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).findByStripePaymentIntentId("pi_test123");
        verify(eventPublisherService, never()).publishInventoryReservationRequest(anyLong(), anyLong(), anyList());
    }

    @Test
    void confirmPayment_WithWrongPaymentIntentId_ShouldReturnError() {
        // Arrange
        testPayment.setStripePaymentIntentId("pi_different123");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByStripePaymentIntentId("pi_test123")).thenReturn(Optional.of(testPayment));
        // Don't mock invoice - let it fail with "Invoice not found"
        when(invoiceRepository.findByOrder(testOrder)).thenReturn(Optional.empty());

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Invoice not found", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).findByStripePaymentIntentId("pi_test123");
    }

    @Test
    void confirmPayment_WithException_ShouldReturnError() {
        // Arrange
        when(orderRepository.findById(1L)).thenThrow(new RuntimeException("Database error"));

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Database error", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
    }

    @Test
    void confirmPayment_WithAlreadyConfirmedOrder_ShouldReturnError() {
        // Arrange
        testOrder.setStatus(OrderStatus.CONFIRMED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByStripePaymentIntentId("pi_test123")).thenReturn(Optional.of(testPayment));
        // Don't mock invoice - let it fail with "Invoice not found"
        when(invoiceRepository.findByOrder(testOrder)).thenReturn(Optional.empty());

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Invoice not found", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).findByStripePaymentIntentId("pi_test123");
    }

    @Test
    void confirmPayment_WithAlreadyPaidPayment_ShouldReturnError() {
        // Arrange
        testPayment.setStatus(PaymentStatus.PAID);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByStripePaymentIntentId("pi_test123")).thenReturn(Optional.of(testPayment));
        // Don't mock invoice - let it fail with "Invoice not found"
        when(invoiceRepository.findByOrder(testOrder)).thenReturn(Optional.empty());

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(paymentConfirmationRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment confirmation failed: Invoice not found", response.getMessage());

        verify(orderRepository, times(1)).findById(1L);
        verify(paymentRepository, times(1)).findByStripePaymentIntentId("pi_test123");
    }

    @Test
    void confirmPayment_WithNullPaymentIntentId_ShouldReturnError() {
        // Arrange
        PaymentConfirmationRequest requestWithNullIntentId = new PaymentConfirmationRequest();
        requestWithNullIntentId.setOrderId(1L);
        requestWithNullIntentId.setPaymentIntentId(null);

        // No mocks needed - service returns early due to validation

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(requestWithNullIntentId);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment intent ID mismatch", response.getMessage());

        // Since validation fails early, no repository calls should be made
        verify(orderRepository, never()).findById(1L);
        verify(paymentRepository, never()).findByStripePaymentIntentId(null);
        verify(orderRepository, never()).save(any());
        verify(eventPublisherService, never()).publishInventoryReservationRequest(anyLong(), anyLong(), anyList());
    }

    @Test
    void confirmPayment_WithEmptyPaymentIntentId_ShouldReturnError() {
        // Arrange
        PaymentConfirmationRequest requestWithEmptyIntentId = new PaymentConfirmationRequest();
        requestWithEmptyIntentId.setOrderId(1L);
        requestWithEmptyIntentId.setPaymentIntentId("");

        // No mocks needed - service returns early due to validation

        // Act
        PaymentConfirmationResponse response = paymentService.confirmPayment(requestWithEmptyIntentId);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Payment intent ID mismatch", response.getMessage());

        // Since validation fails early, no repository calls should be made
        verify(orderRepository, never()).findById(1L);
        verify(paymentRepository, never()).findByStripePaymentIntentId("");
        verify(orderRepository, never()).save(any());
        verify(eventPublisherService, never()).publishInventoryReservationRequest(anyLong(), anyLong(), anyList());
    }
}