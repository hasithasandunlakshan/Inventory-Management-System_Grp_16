package com.Orderservice.Orderservice.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;

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
            default:
                return "📦 Your order " + orderNumber + " is " + newStatus.toString().toLowerCase() + ".";
        }
    }
    
    @Autowired
    private OrderRepository orderRepository;
    
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
            System.err.println("Valid statuses: PENDING, CONFIRMED, PROCESSED, SHIPPED, DELIVERED, CANCELLED");
            throw new IllegalArgumentException("Invalid order status: " + statusStr + 
                ". Valid statuses are: PENDING, CONFIRMED, PROCESSED, SHIPPED, DELIVERED, CANCELLED");
        } catch (Exception e) {
            System.err.println("Error counting orders by status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to count orders by status", e);
        }
    }
}