package com.Orderservice.Orderservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Orderservice.Orderservice.dto.AllPaymentsResponse;
import com.Orderservice.Orderservice.dto.CreatePaymentIntentRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationResponse;
import com.Orderservice.Orderservice.dto.PaymentIntentDto;
import com.Orderservice.Orderservice.dto.PaymentIntentResponse;
import com.Orderservice.Orderservice.dto.PaymentResponse;
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
            // Validate payment intent ID
            if (request.getPaymentIntentId() == null || request.getPaymentIntentId().trim().isEmpty()) {
                return PaymentConfirmationResponse.builder()
                    .success(false)
                    .message("Payment intent ID mismatch")
                    .error("Payment intent ID mismatch")
                    .build();
            }
            
            Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
            
            Payment payment = paymentRepository.findByStripePaymentIntentId(request.getPaymentIntentId())
                .orElseThrow(() -> new RuntimeException("Payment intent ID mismatch"));
            
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
            
            // Publish order notification event
            try {
                // Send notification to the customer
                eventPublisherService.publishOrderNotification(
                    order.getOrderId(),
                    order.getCustomerId(),
                    "ORDER_CONFIRMED",
                    order.getTotalAmount().doubleValue(),
                    "🎉 Order #" + order.getOrderId() + " confirmed! Payment successful. Total: $" + order.getTotalAmount()
                );
                
                // Send notification to user ID 17 (admin/manager) about order confirmation
                String adminConfirmationMessage = String.format(
                    "Order #%d has been confirmed and paid! Customer ID: %d, Total: $%.2f", 
                    order.getOrderId(),
                    order.getCustomerId(),
                    order.getTotalAmount()
                );
                eventPublisherService.publishOrderNotification(
                    order.getOrderId(),
                    17L, // Fixed user ID 17 for admin notifications
                    "ORDER_CONFIRMED",
                    order.getTotalAmount().doubleValue(),
                    adminConfirmationMessage
                );
                
                System.out.println("✅ Order confirmation notifications sent to Kafka successfully!");
            } catch (Exception e) {
                // Log the error but don't fail the payment confirmation
                System.err.println("❌ Failed to publish order notification event: " + e.getMessage());
                e.printStackTrace();
            }
            
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
            }            // Update invoice status
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
                .message("Payment confirmation failed: " + e.getMessage())
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
        
        // 🔔 PUBLISH ORDER NOTIFICATION EVENT
        try {
            System.out.println("📤 Publishing order notification event...");
            
            // Send notification to the customer who placed the order
            String customerMessage = String.format(
                "Your order #%d has been placed successfully! Total amount: $%.2f", 
                savedOrder.getOrderId(), 
                savedOrder.getTotalAmount()
            );
            eventPublisherService.publishOrderNotification(
                savedOrder.getOrderId(),
                savedOrder.getCustomerId(),
                savedOrder.getStatus().toString(),
                savedOrder.getTotalAmount().doubleValue(),
                customerMessage
            );
            
            // Send notification to user ID 17 (admin/manager) about new order arrival
            String adminMessage = String.format(
                "New order has arrived! Order ID: #%d from Customer ID: %d, Total: $%.2f", 
                savedOrder.getOrderId(),
                savedOrder.getCustomerId(),
                savedOrder.getTotalAmount()
            );
            eventPublisherService.publishOrderNotification(
                savedOrder.getOrderId(),
                17L, // Fixed user ID 17 for admin notifications
                savedOrder.getStatus().toString(),
                savedOrder.getTotalAmount().doubleValue(),
                adminMessage
            );
            
            System.out.println("✅ Order notifications published successfully!");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to publish order notifications: " + e.getMessage());
            // Don't fail the order creation if notification fails
            e.printStackTrace();
        }
        
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
    
    /**
     * Get all payments with order details
     * @return AllPaymentsResponse containing all payments
     */
    /**
     * OPTIMIZED: Get all payments with pagination
     * Uses JOIN FETCH to prevent N+1 query problem
     */
    public AllPaymentsResponse getAllPayments(int page, int size) {
        try {
            long startTime = System.currentTimeMillis();
            System.out.println("=== GETTING ALL PAYMENTS (OPTIMIZED) ===");
            System.out.println("Page: " + page + ", Size: " + size);
            
            // Create pageable request
            Pageable pageable = PageRequest.of(page, size);
            
            // Fetch payments with orders in a single query (JOIN FETCH)
            Page<Payment> paymentPage = paymentRepository.findAllPaymentsWithOrders(pageable);
            
            List<PaymentResponse> paymentResponses = new ArrayList<>();
            
            for (Payment payment : paymentPage.getContent()) {
                PaymentResponse paymentResponse = PaymentResponse.builder()
                    .paymentId(payment.getPaymentId())
                    .orderId(payment.getOrder() != null ? payment.getOrder().getOrderId() : null)
                    .customerId(payment.getOrder() != null ? payment.getOrder().getCustomerId() : null)
                    .stripePaymentIntentId(payment.getStripePaymentIntentId())
                    .stripePaymentMethodId(payment.getStripePaymentMethodId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .method(payment.getMethod())
                    .status(payment.getStatus().toString())
                    .paymentDate(payment.getPaymentDate())
                    .createdAt(payment.getCreatedAt())
                    .updatedAt(payment.getUpdatedAt())
                    // Order details (already loaded via JOIN FETCH)
                    .orderStatus(payment.getOrder() != null ? payment.getOrder().getStatus().toString() : null)
                    .orderTotalAmount(payment.getOrder() != null ? payment.getOrder().getTotalAmount() : null)
                    .orderDate(payment.getOrder() != null ? payment.getOrder().getOrderDate() : null)
                    .build();
                
                paymentResponses.add(paymentResponse);
            }
            
            long endTime = System.currentTimeMillis();
            System.out.println("=== OPTIMIZATION COMPLETE ===");
            System.out.println("Total time: " + (endTime - startTime) + "ms");
            System.out.println("Retrieved " + paymentResponses.size() + " payments");
            System.out.println("Database queries: 2 (payments+orders with JOIN FETCH, count)");
            
            return AllPaymentsResponse.builder()
                .success(true)
                .message("Payments retrieved successfully")
                .payments(paymentResponses)
                .totalPayments((int) paymentPage.getTotalElements())
                .pagination(new AllPaymentsResponse.PaginationInfo(
                        page,
                        size,
                        paymentPage.getTotalPages(),
                        paymentPage.getTotalElements()))
                .build();
                
        } catch (Exception e) {
            System.err.println("❌ Error retrieving payments: " + e.getMessage());
            e.printStackTrace();
            
            return AllPaymentsResponse.builder()
                .success(false)
                .message("Failed to retrieve payments: " + e.getMessage())
                .payments(new ArrayList<>())
                .totalPayments(0)
                .build();
        }
    }

    /**
     * DEPRECATED: Use getAllPayments(int page, int size) instead
     * This method loads all payments without pagination
     */
    public AllPaymentsResponse getAllPayments() {
        try {
            System.out.println("=== GETTING ALL PAYMENTS ===");
            
            List<Payment> payments = paymentRepository.findAll();
            List<PaymentResponse> paymentResponses = new ArrayList<>();
            
            for (Payment payment : payments) {
                PaymentResponse paymentResponse = PaymentResponse.builder()
                    .paymentId(payment.getPaymentId())
                    .orderId(payment.getOrder() != null ? payment.getOrder().getOrderId() : null)
                    .customerId(payment.getOrder() != null ? payment.getOrder().getCustomerId() : null)
                    .stripePaymentIntentId(payment.getStripePaymentIntentId())
                    .stripePaymentMethodId(payment.getStripePaymentMethodId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .method(payment.getMethod())
                    .status(payment.getStatus().toString())
                    .paymentDate(payment.getPaymentDate())
                    .createdAt(payment.getCreatedAt())
                    .updatedAt(payment.getUpdatedAt())
                    // Order details
                    .orderStatus(payment.getOrder() != null ? payment.getOrder().getStatus().toString() : null)
                    .orderTotalAmount(payment.getOrder() != null ? payment.getOrder().getTotalAmount() : null)
                    .orderDate(payment.getOrder() != null ? payment.getOrder().getOrderDate() : null)
                    .build();
                
                paymentResponses.add(paymentResponse);
            }
            
            System.out.println("✅ Retrieved " + payments.size() + " payments successfully");
            
            return AllPaymentsResponse.builder()
                .success(true)
                .message("Payments retrieved successfully")
                .payments(paymentResponses)
                .totalPayments(paymentResponses.size())
                .build();
                
        } catch (Exception e) {
            System.err.println("❌ Error retrieving payments: " + e.getMessage());
            e.printStackTrace();
            
            return AllPaymentsResponse.builder()
                .success(false)
                .message("Failed to retrieve payments: " + e.getMessage())
                .payments(new ArrayList<>())
                .totalPayments(0)
                .build();
        }
    }
}