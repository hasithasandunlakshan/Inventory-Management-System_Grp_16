package com.Orderservice.Orderservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.dto.RefundResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Payment;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.enums.PaymentStatus;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.PaymentRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;

// Stripe imports for refund processing
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;

@Service
public class OrderService {
    public AllOrdersResponse getAllOrdersByStatus(String statusStr) {
        try {
            List<Order> orders;
            if (statusStr != null && !statusStr.isEmpty()) {
                com.Orderservice.Orderservice.enums.OrderStatus status = com.Orderservice.Orderservice.enums.OrderStatus.valueOf(statusStr.toUpperCase());
                orders = orderRepository.findByStatus(status);
            } else {
                orders = orderRepository.findAllConfirmedOrdersWithItems();
            }
            List<OrderDetailResponse> orderDetails = new ArrayList<>();
            for (Order order : orders) {
                List<OrderDetailResponse.OrderItemDetail> itemDetails = new ArrayList<>();
                for (OrderItem orderItem : order.getOrderItems()) {
                    String productName = "Unknown Product";
                    String productImageUrl = null;
                    String barcode = null;
                    if (orderItem.getProductId() != null) {
                        Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                        if (productOpt.isPresent()) {
                            Product product = productOpt.get();
                            productName = product.getName();
                            productImageUrl = product.getImageUrl();
                            barcode = product.getBarcode();
                        } else {
                            productName = "Product Not Found";
                        }
                    } else {
                        productName = "No Product ID";
                    }
                    OrderDetailResponse.OrderItemDetail itemDetail = OrderDetailResponse.OrderItemDetail.builder()
                        .orderItemId(orderItem.getOrderItemId())
                        .productId(orderItem.getProductId())
                        .productName(productName)
                        .productImageUrl(productImageUrl)
                        .quantity(orderItem.getQuantity())
                        .price(orderItem.getPrice())
                        .createdAt(orderItem.getCreatedAt())
                        .barcode(barcode)
                        .build();
                    itemDetails.add(itemDetail);
                }
                OrderDetailResponse orderDetail = OrderDetailResponse.builder()
                    .orderId(order.getOrderId())
                    .customerId(order.getCustomerId())
                    .orderDate(order.getOrderDate())
                    .status(order.getStatus().toString())
                    .totalAmount(order.getTotalAmount())
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
                    .refundReason(order.getRefundReason())
                    .refundProcessedAt(order.getRefundProcessedAt())
                    .orderItems(itemDetails)
                    .build();
                orderDetails.add(orderDetail);
            }
            return AllOrdersResponse.builder()
                .success(true)
                .message("Orders retrieved successfully")
                .orders(orderDetails)
                .totalOrders(orderDetails.size())
                .build();
        } catch (Exception e) {
            e.printStackTrace();
            return AllOrdersResponse.builder()
                .success(false)
                .message("Error retrieving orders: " + e.getMessage())
                .orders(new ArrayList<>())
                .totalOrders(0)
                .build();
        }
    }
    public boolean updateOrderStatus(Long orderId, String statusStr) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            try {
                com.Orderservice.Orderservice.enums.OrderStatus oldStatus = order.getStatus();
                com.Orderservice.Orderservice.enums.OrderStatus newStatus = com.Orderservice.Orderservice.enums.OrderStatus.valueOf(statusStr.toUpperCase());
                
                // Update order status
                order.setStatus(newStatus);
                Order updatedOrder = orderRepository.save(order);
                
                System.out.println("=== ORDER STATUS UPDATE ===");
                System.out.println("Order ID: " + orderId);
                System.out.println("Customer ID: " + order.getCustomerId());
                System.out.println("Status changed from " + oldStatus + " to " + newStatus);
                
                // Publish order status update notification
                try {
                    String notificationMessage = createStatusUpdateMessage(updatedOrder, oldStatus, newStatus);
                    
                    eventPublisherService.publishOrderNotification(
                        "ORDER_STATUS_UPDATED",
                        updatedOrder.getOrderId(),
                        updatedOrder.getCustomerId(),
                        newStatus.toString(),
                        updatedOrder.getTotalAmount().doubleValue(),
                        notificationMessage
                    );
                    
                    System.out.println("✅ Order status update notification sent to Kafka successfully!");
                    System.out.println("Message: " + notificationMessage);
                    
                } catch (Exception e) {
                    // Log the error but don't fail the status update
                    System.err.println("❌ Failed to publish order status update notification: " + e.getMessage());
                    e.printStackTrace();
                }
                
                System.out.println("===============================");
                return true;
                
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid status string: " + statusStr);
                return false;
            }
        }
        System.err.println("Order not found with ID: " + orderId);
        return false;
    }
    
    /**
     * Create a user-friendly message for status updates
     */
    private String createStatusUpdateMessage(Order order, com.Orderservice.Orderservice.enums.OrderStatus oldStatus, com.Orderservice.Orderservice.enums.OrderStatus newStatus) {
        String orderNumber = "#" + order.getOrderId();
        
        switch (newStatus) {
            case PENDING:
                return "📋 Your order " + orderNumber + " is pending.";
            case CONFIRMED:
                return "✅ Your order " + orderNumber + " is confirmed!";
            case PROCESSED:
                return "🔄 Your order " + orderNumber + " is processed.";
            case SHIPPED:
                return "🚚 Your order " + orderNumber + " is shipped!";
            case DELIVERED:
                return "🎉 Your order " + orderNumber + " is delivered!";
            case CANCELLED:
                return "❌ Your order " + orderNumber + " is cancelled.";
            case REFUNDED:
                return "💰 Your order " + orderNumber + " has been refunded.";
            default:
                return "📦 Your order " + orderNumber + " is " + newStatus.toString().toLowerCase() + ".";
        }
    }
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private EventPublisherService eventPublisherService;
    
    public AllOrdersResponse getAllOrders() {
        try {
            // Get only CONFIRMED orders
            List<Order> orders = orderRepository.findAllConfirmedOrdersWithItems();
            List<OrderDetailResponse> orderDetails = new ArrayList<>();
            
            for (Order order : orders) {
                List<OrderDetailResponse.OrderItemDetail> itemDetails = new ArrayList<>();
                
                // Get order items with product details including image_url
                for (OrderItem orderItem : order.getOrderItems()) {
                    String productName = "Unknown Product";
                    String productImageUrl = null;
                    String barcode = null;
                    
                    // Check if productId is not null before querying
                    if (orderItem.getProductId() != null) {
                        try {
                            Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                            if (productOpt.isPresent()) {
                                Product product = productOpt.get();
                                productName = product.getName();
                                productImageUrl = product.getImageUrl();
                                barcode = product.getBarcode(); // Fetch barcode
                            } else {
                                productName = "Product Not Found";
                            }
                        } catch (Exception e) {
                            System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - " + e.getMessage());
                            productName = "Error Loading Product";
                        }
                    } else {
                        System.err.println("OrderItem " + orderItem.getOrderItemId() + " has null productId");
                        productName = "No Product ID";
                    }
                    
                    
                    
                    OrderDetailResponse.OrderItemDetail itemDetail = OrderDetailResponse.OrderItemDetail.builder()
                        .orderItemId(orderItem.getOrderItemId())
                        .productId(orderItem.getProductId())
                        .productName(productName)
                        .productImageUrl(productImageUrl)
                        .quantity(orderItem.getQuantity())
                        .price(orderItem.getPrice())
                        .createdAt(orderItem.getCreatedAt())
                        .barcode(barcode)
                        .build();
                    
                    itemDetails.add(itemDetail);
                }
                
                OrderDetailResponse orderDetail = OrderDetailResponse.builder()
                    .orderId(order.getOrderId())
                    .customerId(order.getCustomerId())
                    .orderDate(order.getOrderDate())
                    .status(order.getStatus().toString())
                    .totalAmount(order.getTotalAmount())
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
                    .orderItems(itemDetails)
                    .build();
                
                orderDetails.add(orderDetail);
            }
            
            return AllOrdersResponse.builder()
                .success(true)
                .message("Confirmed orders retrieved successfully")
                .orders(orderDetails)
                .totalOrders(orderDetails.size())
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return AllOrdersResponse.builder()
                .success(false)
                .message("Error retrieving orders: " + e.getMessage())
                .orders(new ArrayList<>())
                .totalOrders(0)
                .build();
        }
    }
    
    public OrderDetailResponse getOrderById(Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            
            if (orderOpt.isEmpty()) {
                return null;
            }
            
            Order order = orderOpt.get();
            
            // Check if order is CONFIRMED
            if (!order.getStatus().toString().equals("CONFIRMED")) {
                return null; // Return null for non-confirmed orders
            }
            
            List<OrderDetailResponse.OrderItemDetail> itemDetails = new ArrayList<>();
            
            // Get order items with product details including image_url
            for (OrderItem orderItem : order.getOrderItems()) {
                String productName = "Unknown Product";
                String productImageUrl = null;
                
                // Check if productId is not null before querying
                if (orderItem.getProductId() != null) {
                    try {
                        Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                        if (productOpt.isPresent()) {
                            Product product = productOpt.get();
                            productName = product.getName();
                            productImageUrl = product.getImageUrl();
                        } else {
                            productName = "Product Not Found";
                        }
                    } catch (Exception e) {
                        System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - " + e.getMessage());
                        productName = "Error Loading Product";
                    }
                } else {
                    System.err.println("OrderItem " + orderItem.getOrderItemId() + " has null productId");
                    productName = "No Product ID";
                }
                
                OrderDetailResponse.OrderItemDetail itemDetail = OrderDetailResponse.OrderItemDetail.builder()
                    .orderItemId(orderItem.getOrderItemId())
                    .productId(orderItem.getProductId())
                    .productName(productName)
                    .productImageUrl(productImageUrl) // Add image URL
                    .quantity(orderItem.getQuantity())
                    .price(orderItem.getPrice())
                    .createdAt(orderItem.getCreatedAt())
                    .build();
                
                itemDetails.add(itemDetail);
            }
            
            return OrderDetailResponse.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomerId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().toString())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .refundReason(order.getRefundReason())
                .refundProcessedAt(order.getRefundProcessedAt())
                .orderItems(itemDetails)
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public AllOrdersResponse getOrdersByCustomerId(Long customerId) {
        try {
            List<Order> orders = orderRepository.findByCustomerIdWithOrderItems(customerId);
            List<OrderDetailResponse> orderDetails = new ArrayList<>();
            
            for (Order order : orders) {
                List<OrderDetailResponse.OrderItemDetail> itemDetails = new ArrayList<>();
                
                // Get order items with product details including image_url
                for (OrderItem orderItem : order.getOrderItems()) {
                    String productName = "Unknown Product";
                    String productImageUrl = null;
                    String barcode = null;
                    
                    // Check if productId is not null before querying
                    if (orderItem.getProductId() != null) {
                        try {
                            Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                            if (productOpt.isPresent()) {
                                Product product = productOpt.get();
                                productName = product.getName();
                                productImageUrl = product.getImageUrl();
                                barcode = product.getBarcode();
                            } else {
                                productName = "Product Not Found";
                            }
                        } catch (Exception e) {
                            System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - " + e.getMessage());
                            productName = "Error Loading Product";
                        }
                    } else {
                        System.err.println("OrderItem " + orderItem.getOrderItemId() + " has null productId");
                        productName = "No Product ID";
                    }
                    
                    OrderDetailResponse.OrderItemDetail itemDetail = OrderDetailResponse.OrderItemDetail.builder()
                        .orderItemId(orderItem.getOrderItemId())
                        .productId(orderItem.getProductId())
                        .productName(productName)
                        .productImageUrl(productImageUrl)
                        .quantity(orderItem.getQuantity())
                        .price(orderItem.getPrice())
                        .createdAt(orderItem.getCreatedAt())
                        .barcode(barcode)
                        .build();
                    
                    itemDetails.add(itemDetail);
                }
                
                OrderDetailResponse orderDetail = OrderDetailResponse.builder()
                    .orderId(order.getOrderId())
                    .customerId(order.getCustomerId())
                    .orderDate(order.getOrderDate())
                    .status(order.getStatus().toString())
                    .totalAmount(order.getTotalAmount())
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
                    .orderItems(itemDetails)
                    .build();
                
                orderDetails.add(orderDetail);
            }
            
            return AllOrdersResponse.builder()
                .success(true)
                .message("Orders for customer retrieved successfully")
                .orders(orderDetails)
                .totalOrders(orderDetails.size())
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return AllOrdersResponse.builder()
                .success(false)
                .message("Error retrieving orders for customer: " + e.getMessage())
                .orders(new ArrayList<>())
                .totalOrders(0)
                .build();
        }
    }

    /**
     * Get count of orders by status
     * @param statusStr The status string (e.g., "CONFIRMED", "PROCESSED")
     * @return Count of orders with the specified status
     */
    public long getOrderCountByStatus(String statusStr) {
        try {
            System.out.println("=== COUNTING ORDERS BY STATUS ===");
            System.out.println("Status: " + statusStr);
            
            // Convert string to OrderStatus enum
            com.Orderservice.Orderservice.enums.OrderStatus status = 
                com.Orderservice.Orderservice.enums.OrderStatus.valueOf(statusStr.toUpperCase());
            
            // Get orders by status
            List<Order> orders = orderRepository.findByStatus(status);
            
            System.out.println("Found " + orders.size() + " orders with status: " + statusStr);
            
            return orders.size();
            
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid order status: " + statusStr);
            System.err.println("Valid statuses: PENDING, CONFIRMED, PROCESSED, SHIPPED, DELIVERED, CANCELLED, REFUNDED");
            throw new IllegalArgumentException("Invalid order status: " + statusStr + 
                ". Valid statuses are: PENDING, CONFIRMED, PROCESSED, SHIPPED, DELIVERED, CANCELLED, REFUNDED");
        } catch (Exception e) {
            System.err.println("Error counting orders by status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to count orders by status", e);
        }
    }
    
    /**
     * Process a refund for an order
     * @param orderId The ID of the order to refund
     * @param refundReason The reason for the refund
     * @return RefundResponse indicating success or failure
     */
    public RefundResponse processRefund(Long orderId, String refundReason) {
        try {
            System.out.println("=== PROCESSING REFUND ===");
            System.out.println("Order ID: " + orderId);
            System.out.println("Reason: " + refundReason);
            
            // Find the order
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (!orderOpt.isPresent()) {
                System.err.println("Order not found with ID: " + orderId);
                return RefundResponse.failure(orderId, "Order not found");
            }
            
            Order order = orderOpt.get();
            
            // Validate order status for refund eligibility
            OrderStatus currentStatus = order.getStatus();
            if (!isEligibleForRefund(currentStatus)) {
                String message = "Order with status " + currentStatus + " is not eligible for refund";
                System.err.println(message);
                return RefundResponse.failure(orderId, message);
            }
            
            // Check if order is already refunded
            if (currentStatus == OrderStatus.REFUNDED) {
                String message = "Order is already refunded";
                System.err.println(message);
                return RefundResponse.failure(orderId, message);
            }
            
            BigDecimal refundAmount = order.getTotalAmount();
            
            // Update payment status to REFUNDED (includes Stripe refund processing)
            boolean paymentRefunded = updatePaymentStatusToRefunded(orderId, refundReason);
            if (!paymentRefunded) {
                String errorMessage = "Failed to process refund through Stripe. Refund request not completed.";
                System.err.println(errorMessage);
                return RefundResponse.failure(orderId, errorMessage);
            }
            
            // Restore inventory for order items
            restoreInventoryForOrder(order);
            
            // Update order status to REFUNDED and store refund details
            OrderStatus oldStatus = order.getStatus();
            order.setStatus(OrderStatus.REFUNDED);
            order.setRefundReason(refundReason);
            order.setRefundProcessedAt(LocalDateTime.now());
            Order updatedOrder = orderRepository.save(order);
            
            // Send refund notification
            try {
                String notificationMessage = createRefundNotificationMessage(updatedOrder, refundReason);
                
                eventPublisherService.publishOrderNotification(
                    "ORDER_REFUNDED",
                    updatedOrder.getOrderId(),
                    updatedOrder.getCustomerId(),
                    OrderStatus.REFUNDED.toString(),
                    updatedOrder.getTotalAmount().doubleValue(),
                    notificationMessage
                );
                
                System.out.println("✅ Refund notification sent to Kafka successfully!");
                System.out.println("Message: " + notificationMessage);
                
            } catch (Exception e) {
                System.err.println("❌ Failed to publish refund notification: " + e.getMessage());
                e.printStackTrace();
            }
            
            System.out.println("✅ Refund processed successfully");
            System.out.println("Amount refunded: $" + refundAmount);
            System.out.println("Status changed from " + oldStatus + " to " + OrderStatus.REFUNDED);
            System.out.println("===============================");
            
            return RefundResponse.success(orderId, refundAmount, refundReason);
            
        } catch (Exception e) {
            System.err.println("Error processing refund for order " + orderId + ": " + e.getMessage());
            e.printStackTrace();
            return RefundResponse.failure(orderId, "Failed to process refund: " + e.getMessage());
        }
    }
    
    /**
     * Check if an order status is eligible for refund
     */
    private boolean isEligibleForRefund(OrderStatus status) {
        // Orders can be refunded if they are CONFIRMED, PROCESSED, SHIPPED, or DELIVERED
        // PENDING orders should be cancelled instead of refunded
        // CANCELLED and REFUNDED orders cannot be refunded
        return status == OrderStatus.CONFIRMED || 
               status == OrderStatus.PROCESSED || 
               status == OrderStatus.SHIPPED || 
               status == OrderStatus.DELIVERED;
    }
    
    /**
     * Update payment status to REFUNDED for all payments associated with the order
     */
    private boolean updatePaymentStatusToRefunded(Long orderId, String refundReason) {
        try {
            // Find payments for this order and process refunds
            List<Payment> payments = paymentRepository.findByOrderOrderId(orderId);
            boolean allRefundsSuccessful = true;
            
            for (Payment payment : payments) {
                // Only process refund if payment is not already refunded
                if (payment.getStatus() != PaymentStatus.REFUNDED) {
                    // First, process the refund through Stripe
                    boolean stripeRefundSuccessful = processStripeRefund(payment, refundReason);
                    
                    if (stripeRefundSuccessful) {
                        // Only update local status if Stripe refund was successful
                        payment.setStatus(PaymentStatus.REFUNDED);
                        paymentRepository.save(payment);
                        System.out.println("Payment " + payment.getPaymentId() + " successfully refunded through Stripe and status updated to REFUNDED");
                    } else {
                        System.err.println("Failed to process Stripe refund for payment " + payment.getPaymentId());
                        allRefundsSuccessful = false;
                        // Continue processing other payments even if one fails
                    }
                } else {
                    System.out.println("Payment " + payment.getPaymentId() + " is already refunded, skipping");
                }
            }
            
            return allRefundsSuccessful;
        } catch (Exception e) {
            System.err.println("Error updating payment status to REFUNDED: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Process Stripe refund for a payment
     */
    private boolean processStripeRefund(Payment payment, String refundReason) {
        try {
            // Check if payment has a Stripe payment intent ID
            if (payment.getStripePaymentIntentId() == null || payment.getStripePaymentIntentId().isEmpty()) {
                System.err.println("Payment " + payment.getPaymentId() + " has no Stripe payment intent ID");
                return false;
            }
            
            // Create refund parameters
            RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(payment.getStripePaymentIntentId())
                .setAmount((long) (payment.getAmount().doubleValue() * 100)) // Convert to cents
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                .putMetadata("refund_reason", refundReason != null ? refundReason : "Order refund")
                .putMetadata("order_id", payment.getOrder().getOrderId().toString())
                .putMetadata("payment_id", payment.getPaymentId().toString())
                .build();
            
            // Process the refund through Stripe
            Refund refund = Refund.create(params);
            
            System.out.println("Stripe refund created successfully:");
            System.out.println("  Refund ID: " + refund.getId());
            System.out.println("  Payment Intent: " + payment.getStripePaymentIntentId());
            System.out.println("  Amount: $" + refund.getAmount() / 100.0);
            System.out.println("  Status: " + refund.getStatus());
            
            return true;
            
        } catch (StripeException e) {
            System.err.println("Stripe refund failed for payment " + payment.getPaymentId() + ": " + e.getMessage());
            System.err.println("Stripe error type: " + e.getStripeError().getType());
            System.err.println("Stripe error code: " + e.getStripeError().getCode());
            return false;
        } catch (Exception e) {
            System.err.println("Unexpected error during Stripe refund: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Restore inventory quantities for order items
     */
    private void restoreInventoryForOrder(Order order) {
        try {
            System.out.println("--- Restoring inventory for order items ---");
            
            for (OrderItem orderItem : order.getOrderItems()) {
                if (orderItem.getProductId() != null) {
                    try {
                        Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                        if (productOpt.isPresent()) {
                            Product product = productOpt.get();
                            
                            // Restore the quantity
                            int currentStock = product.getStockQuantity();
                            int orderedQuantity = orderItem.getQuantity();
                            int newStock = currentStock + orderedQuantity;
                            
                            product.setStockQuantity(newStock);
                            productRepository.save(product);
                            
                            System.out.println("Product " + product.getName() + " stock restored: " + 
                                             currentStock + " + " + orderedQuantity + " = " + newStock);
                        } else {
                            System.err.println("Product not found for ID: " + orderItem.getProductId());
                        }
                    } catch (Exception e) {
                        System.err.println("Error restoring inventory for product " + orderItem.getProductId() + ": " + e.getMessage());
                    }
                }
            }
            
            System.out.println("--- Inventory restoration completed ---");
            
        } catch (Exception e) {
            System.err.println("Error during inventory restoration: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Create a user-friendly refund notification message
     */
    private String createRefundNotificationMessage(Order order, String refundReason) {
        String orderNumber = "#" + order.getOrderId();
        String amount = "$" + order.getTotalAmount().toString();
        
        if (refundReason != null && !refundReason.trim().isEmpty()) {
            return "💰 Your order " + orderNumber + " has been refunded (" + amount + "). Reason: " + refundReason;
        } else {
            return "💰 Your order " + orderNumber + " has been refunded (" + amount + ").";
        }
    }
}