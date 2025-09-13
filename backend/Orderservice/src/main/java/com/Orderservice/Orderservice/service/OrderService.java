package com.Orderservice.Orderservice.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Orderservice.Orderservice.client.UserServiceClient;
import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.dto.UserDetailsResponse;
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
                com.Orderservice.Orderservice.enums.OrderStatus status = com.Orderservice.Orderservice.enums.OrderStatus
                        .valueOf(statusStr.toUpperCase());
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
                com.Orderservice.Orderservice.enums.OrderStatus newStatus = com.Orderservice.Orderservice.enums.OrderStatus
                        .valueOf(statusStr.toUpperCase());

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
                            notificationMessage);

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
    private String createStatusUpdateMessage(Order order, com.Orderservice.Orderservice.enums.OrderStatus oldStatus,
            com.Orderservice.Orderservice.enums.OrderStatus newStatus) {
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

    @Autowired
    private UserServiceClient userServiceClient;

    public AllOrdersResponse getAllOrders() {
        try {
            System.out.println("🔍 OrderService.getAllOrders() called at: " + java.time.LocalDateTime.now());

            // First, let's check ALL orders to see what's in the database
            List<Order> allOrders = orderRepository.findAll();
            System.out.println("📊 Total orders in database: " + allOrders.size());

            // Count by status
            long confirmedCount = allOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus().toString())).count();
            long pendingCount = allOrders.stream().filter(o -> "PENDING".equals(o.getStatus().toString())).count();
            long processedCount = allOrders.stream().filter(o -> "PROCESSED".equals(o.getStatus().toString())).count();

            System.out.println("📈 Order counts by status:");
            System.out.println("  - CONFIRMED: " + confirmedCount);
            System.out.println("  - PENDING: " + pendingCount);
            System.out.println("  - PROCESSED: " + processedCount);

            // Test both queries to see if JOIN FETCH is causing issues
            List<Order> confirmedOrdersOnly = orderRepository.findAllConfirmedOrdersOnly();
            System.out.println("📊 Confirmed orders (without JOIN FETCH): " + confirmedOrdersOnly.size());

            List<Order> orders = orderRepository.findAllConfirmedOrdersWithItems();
            System.out.println("📊 Confirmed orders (with JOIN FETCH): " + orders.size());

            // Check if the difference is due to orders without items
            if (confirmedOrdersOnly.size() != orders.size()) {
                System.out.println("⚠️  Some confirmed orders don't have items! Difference: " +
                        (confirmedOrdersOnly.size() - orders.size()));
            }

            // Log ALL confirmed order IDs for debugging
            if (!orders.isEmpty()) {
                System.out.println("📋 All confirmed order IDs: " +
                        orders.stream().map(o -> o.getOrderId()).sorted().toList());
                System.out.println("📅 Order dates: " +
                        orders.stream().limit(5).map(o -> o.getOrderId() + ":" + o.getOrderDate()).toList());
            }

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
                            System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - "
                                    + e.getMessage());
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

                // Fetch customer details using UserServiceClient
                String customerName = "Unknown Customer";
                String customerEmail = "";
                String customerAddress = "Address not available";
                Double customerLatitude = null;
                Double customerLongitude = null;

                if (order.getCustomerId() != null) {
                    try {
                        UserDetailsResponse.UserInfo userInfo = userServiceClient.getUserById(order.getCustomerId());
                        if (userInfo != null) {
                            customerName = userInfo.getFullName() != null ? userInfo.getFullName()
                                    : userInfo.getUsername();
                            customerEmail = userInfo.getEmail();
                            customerAddress = userInfo.getFormattedAddress() != null ? userInfo.getFormattedAddress()
                                    : "Address not provided";
                            customerLatitude = userInfo.getLatitude();
                            customerLongitude = userInfo.getLongitude();

                            System.out.println("Successfully fetched customer details for ID " + order.getCustomerId());
                            System.out.println("Customer name: " + customerName);
                            System.out.println("Customer address: " + customerAddress);
                        } else {
                            System.out.println("No user found for customer ID: " + order.getCustomerId());
                        }
                    } catch (Exception e) {
                        System.err.println("Error fetching customer details for ID " + order.getCustomerId() + ": "
                                + e.getMessage());
                        e.printStackTrace();
                    }
                }

                OrderDetailResponse orderDetail = OrderDetailResponse.builder()
                        .orderId(order.getOrderId())
                        .customerId(order.getCustomerId())
                        .customerName(customerName)
                        .customerEmail(customerEmail)
                        .customerAddress(customerAddress)
                        .customerLatitude(customerLatitude)
                        .customerLongitude(customerLongitude)
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
                        System.err.println(
                                "Error fetching product with ID: " + orderItem.getProductId() + " - " + e.getMessage());
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
                            System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - "
                                    + e.getMessage());
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
     * 
     * @param statusStr The status string (e.g., "CONFIRMED", "PROCESSED")
     * @return Count of orders with the specified status
     */
    public long getOrderCountByStatus(String statusStr) {
        try {
            System.out.println("=== COUNTING ORDERS BY STATUS ===");
            System.out.println("Status: " + statusStr);

            // Convert string to OrderStatus enum
            com.Orderservice.Orderservice.enums.OrderStatus status = com.Orderservice.Orderservice.enums.OrderStatus
                    .valueOf(statusStr.toUpperCase());

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

    /**
     * Debug method to get all orders regardless of status
     * 
     * @return AllOrdersResponse containing all orders
     */
    public AllOrdersResponse getAllOrdersDebug() {
        try {
            // Get ALL orders regardless of status
            List<Order> orders = orderRepository.findAllWithOrderItems();
            List<OrderDetailResponse> orderDetails = new ArrayList<>();

            System.out.println("DEBUG: Found " + orders.size() + " total orders in database");

            for (Order order : orders) {
                System.out.println("Order ID: " + order.getOrderId() + ", Status: " + order.getStatus() +
                        ", Customer ID: " + order.getCustomerId() + ", Total: " + order.getTotalAmount());

                List<OrderDetailResponse.OrderItemDetail> itemDetails = new ArrayList<>();

                // Get order items with product details
                for (OrderItem orderItem : order.getOrderItems()) {
                    String productName = "Unknown Product";
                    String productImageUrl = null;
                    String barcode = null;

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
                            System.err.println("Error fetching product with ID: " + orderItem.getProductId() + " - "
                                    + e.getMessage());
                            productName = "Error Loading Product";
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
                            .barcode(barcode)
                            .price(orderItem.getPrice())
                            .createdAt(orderItem.getCreatedAt())
                            .build();

                    itemDetails.add(itemDetail);
                }

                // Try to get customer details from user service
                String customerName = null;
                String customerEmail = null;
                String customerAddress = null;
                Double customerLatitude = null;
                Double customerLongitude = null;

                try {
                    UserDetailsResponse.UserInfo userResponse = userServiceClient.getUserById(order.getCustomerId());
                    if (userResponse != null) {
                        customerName = userResponse.getFullName();
                        customerEmail = userResponse.getEmail();
                        customerAddress = userResponse.getFormattedAddress();
                        customerLatitude = userResponse.getLatitude();
                        customerLongitude = userResponse.getLongitude();
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching customer details for customer ID: "
                            + order.getCustomerId() + " - " + e.getMessage());
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
                        .customerName(customerName)
                        .customerEmail(customerEmail)
                        .customerAddress(customerAddress)
                        .customerLatitude(customerLatitude)
                        .customerLongitude(customerLongitude)
                        .build();

                orderDetails.add(orderDetail);
            }

            return AllOrdersResponse.builder()
                    .success(true)
                    .message("DEBUG: Retrieved all orders successfully (all statuses)")
                    .orders(orderDetails)
                    .totalOrders(orders.size())
                    .build();

        } catch (Exception e) {
            System.err.println("Error in getAllOrdersDebug: " + e.getMessage());
            e.printStackTrace();

            return AllOrdersResponse.builder()
                    .success(false)
                    .message("Failed to retrieve debug orders: " + e.getMessage())
                    .orders(new ArrayList<>())
                    .totalOrders(0)
                    .build();
        }
    }

    /**
     * Debug method to get counts of orders by status
     */
    public Map<String, Object> getOrderStatusCounts() {
        try {
            List<Order> allOrders = orderRepository.findAllWithOrderItems();

            Map<String, Long> statusCounts = allOrders.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            order -> order.getStatus().toString(),
                            java.util.stream.Collectors.counting()));

            long totalOrders = allOrders.size();
            long confirmedOrders = statusCounts.getOrDefault("CONFIRMED", 0L);

            System.out.println("=== ORDER STATUS BREAKDOWN ===");
            System.out.println("Total orders in database: " + totalOrders);
            statusCounts.forEach((status, count) -> System.out.println(status + ": " + count + " orders"));
            System.out.println("CONFIRMED orders (what shipping page should show): " + confirmedOrders);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("totalOrders", totalOrders);
            response.put("confirmedOrders", confirmedOrders);
            response.put("statusBreakdown", statusCounts);
            response.put("message", "Order status counts retrieved successfully");

            return response;

        } catch (Exception e) {
            System.err.println("Error getting order status counts: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get order status counts: " + e.getMessage());
            response.put("totalOrders", 0);
            response.put("confirmedOrders", 0);

            return response;
        }
    }
}