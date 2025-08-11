package com.Orderservice.Orderservice.service;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
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
}