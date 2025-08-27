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
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import com.Orderservice.Orderservice.repository.InvoiceRepository;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.PaymentRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
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
    private ProductRepository productRepository;
    
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
            System.out.println("=== ORDER CONFIRMATION & INVENTORY RESERVATION ===");
            System.out.println("Order ID: " + order.getOrderId());
            System.out.println("Customer ID: " + order.getCustomerId());
            System.out.println("Updating order status from " + order.getStatus() + " to CONFIRMED");
            
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            
            System.out.println("Order confirmed successfully!");
            System.out.println("Publishing inventory reservation request to Kafka...");
            System.out.println("Items to reserve:");
            for (var item : order.getOrderItems()) {
                System.out.println("  - Product ID: " + item.getProductId() + 
                                 ", Barcode: " + item.getBarcode() + 
                                 ", Quantity: " + item.getQuantity());
            }
            
            // Publish inventory reservation event
            try {
                eventPublisherService.publishInventoryReservationRequest(
                    order.getOrderId(), 
                    order.getCustomerId(), 
                    order.getOrderItems()
                );
                System.out.println("✅ Inventory reservation request sent to Kafka successfully!");
            } catch (Exception e) {
                // Log the error but don't fail the payment confirmation
                System.err.println("❌ Failed to publish inventory reservation event: " + e.getMessage());
                e.printStackTrace();
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
        System.out.println("--- CREATING ORDER IN DATABASE ---");
        System.out.println("Customer ID: " + request.getCustomerId());
        System.out.println("Amount (cents): " + request.getAmount());
        System.out.println("Total Amount (dollars): " + new BigDecimal(request.getAmount()).divide(new BigDecimal(100)));
        
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal(request.getAmount()).divide(new BigDecimal(100)));
        order.setOrderItems(new ArrayList<>());
        
        order = orderRepository.save(order);
        System.out.println("Order saved with ID: " + order.getOrderId());
        
        // Create order items
        System.out.println("Creating order items...");
        for (CreatePaymentIntentRequest.OrderItem item : request.getOrderItems()) {
            System.out.println("Adding item - Product ID: " + item.getProductId() + 
                             ", Quantity: " + item.getQuantity() + 
                             ", Unit Price: " + item.getUnitPrice() +
                             ", Barcode from request: " + item.getBarcode());
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getUnitPrice());
            
            // Set barcode - prefer from request, fallback to product lookup
            if (item.getBarcode() != null && !item.getBarcode().trim().isEmpty()) {
                try {
                    // Use barcode from request
                    orderItem.setBarcode(Integer.parseInt(item.getBarcode().replaceAll("[^0-9]", "")));
                    System.out.println("Using barcode from request: " + orderItem.getBarcode());
                } catch (NumberFormatException e) {
                    // If barcode is not numeric, use hashCode as fallback
                    orderItem.setBarcode(item.getBarcode().hashCode());
                    System.out.println("Non-numeric barcode from request, using hash: " + orderItem.getBarcode());
                }
            } else {
                // Fallback: fetch product details to get barcode
                System.out.println("No barcode in request, fetching from product...");
                Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + item.getProductId()));
                
                System.out.println("Found product: " + product.getName() + ", Product barcode: " + product.getBarcode());
                
                if (product.getBarcode() != null) {
                    try {
                        orderItem.setBarcode(Integer.parseInt(product.getBarcode().replaceAll("[^0-9]", "")));
                    } catch (NumberFormatException e) {
                        orderItem.setBarcode(product.getBarcode().hashCode());
                        System.out.println("Non-numeric product barcode, using hash: " + orderItem.getBarcode());
                    }
                }
            }
            
            order.getOrderItems().add(orderItem);
        }
        
        Order savedOrder = orderRepository.save(order);
        System.out.println("Order created successfully with " + savedOrder.getOrderItems().size() + " items");
        System.out.println("Order Status: " + savedOrder.getStatus());
        System.out.println("------------------------------------");
        
        return savedOrder;
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