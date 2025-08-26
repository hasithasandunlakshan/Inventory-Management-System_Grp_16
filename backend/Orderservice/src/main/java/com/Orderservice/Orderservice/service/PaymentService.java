package com.Orderservice.Orderservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Orderservice.Orderservice.dto.CreatePaymentIntentRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationResponse;
import com.Orderservice.Orderservice.dto.PaymentIntentDto;
import com.Orderservice.Orderservice.dto.PaymentIntentResponse;
import com.Orderservice.Orderservice.entity.Invoice;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Payment;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import com.Orderservice.Orderservice.repository.InvoiceRepository;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;


@Service
@Transactional
public class PaymentService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private EventPublisherService eventPublisherService;
    

    

    
    
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        try {
            // 1. Create order first
            Order order = createOrder(request);
            
            // 2. Create payment intent with Stripe
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount())
                .setCurrency(request.getCurrency())
                .putMetadata("order_id", order.getOrderId().toString())
                .putMetadata("customer_id", request.getCustomerId().toString())
                .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            // 3. Save payment record
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setAmount(new BigDecimal(request.getAmount()).divide(new BigDecimal(100)));
            payment.setCurrency(request.getCurrency());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
            
            // 4. Create invoice
            createInvoice(order);
            
            return PaymentIntentResponse.builder()
                .success(true)
                .paymentIntent(convertToPaymentIntentDto(paymentIntent))
                .orderId(order.getOrderId())
                .message("Payment intent created successfully")
                .build();
                
        } catch (StripeException e) {
            return PaymentIntentResponse.builder()
                .success(false)
                .error("Stripe error: " + e.getMessage())
                .build();
        }
    }
    
    public PaymentConfirmationResponse confirmPayment(PaymentConfirmationRequest request) {
        try {
            Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
            
            Payment payment = paymentRepository.findByStripePaymentIntentId(request.getPaymentIntentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            // Update payment status
            payment.setStripePaymentMethodId(request.getPaymentMethodId());
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update order status
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            
            // Publish inventory reservation event
            try {
                eventPublisherService.publishInventoryReservationRequest(
                    order.getOrderId(), 
                    order.getCustomerId(), 
                    order.getOrderItems()
                );
            } catch (Exception e) {
                // Log the error but don't fail the payment confirmation
                System.err.println("Failed to publish inventory reservation event: " + e.getMessage());
            }
            
            // Update invoice status
            Invoice invoice = invoiceRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoiceRepository.save(invoice);
            
            return PaymentConfirmationResponse.builder()
                .success(true)
                .message("Payment confirmed successfully")
                .build();
                
        } catch (Exception e) {
            return PaymentConfirmationResponse.builder()
                .success(false)
                .error("Payment confirmation failed: " + e.getMessage())
                .build();
        }
    }
    
    private Order createOrder(CreatePaymentIntentRequest request) {
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal(request.getAmount()).divide(new BigDecimal(100)));
        order.setOrderItems(new ArrayList<>());
        
        order = orderRepository.save(order);
        
        // Create order items
        for (CreatePaymentIntentRequest.Item item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            order.getOrderItems().add(orderItem);
        }
        
        return orderRepository.save(order);
    }
    
    private void createInvoice(Order order) {
        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setAmount(order.getTotalAmount());
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setDueDate(LocalDateTime.now().plusDays(30));
        invoiceRepository.save(invoice);
    }
    
    private PaymentIntentDto convertToPaymentIntentDto(PaymentIntent paymentIntent) {
        PaymentIntentDto dto = new PaymentIntentDto();
        dto.setId(paymentIntent.getId());
        dto.setClientSecret(paymentIntent.getClientSecret());
        dto.setAmount(paymentIntent.getAmount());
        dto.setCurrency(paymentIntent.getCurrency());
        dto.setStatus(paymentIntent.getStatus());
        return dto;
    }
}