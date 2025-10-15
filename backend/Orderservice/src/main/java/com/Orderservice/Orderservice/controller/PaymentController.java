package com.Orderservice.Orderservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.AllPaymentsResponse;
import com.Orderservice.Orderservice.dto.CreatePaymentIntentRequest;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.dto.PaymentConfirmationRequest;
import com.Orderservice.Orderservice.dto.PaymentConfirmationResponse;
import com.Orderservice.Orderservice.dto.PaymentIntentResponse;
import com.Orderservice.Orderservice.dto.UpdateOrderStatusRequest;
import com.Orderservice.Orderservice.dto.OrderStatusRequest;
import com.Orderservice.Orderservice.service.OrderService;
import com.Orderservice.Orderservice.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PaymentController {
    @PostMapping("/update-order-status")
    public ResponseEntity<String> updateOrderStatus(@RequestBody UpdateOrderStatusRequest request) {
        boolean updated = orderService.updateOrderStatus(request.getOrderId(), request.getStatus());
        if (updated) {
            return ResponseEntity.ok("Order status updated successfully.");
        } else {
            return ResponseEntity.badRequest().body("Failed to update order status.");
        }
    }

    @Autowired
    private PaymentService paymentService;

    @Autowired // Make sure this annotation is present
    private OrderService orderService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request) {

        System.out.println("=== INCOMING ORDER CREATION REQUEST ===");
        System.out.println("Customer ID: " + request.getCustomerId());
        System.out.println("Total Amount: " + request.getAmount());
        System.out.println("Currency: " + request.getCurrency());
        System.out.println(
                "Order Items Count: " + (request.getOrderItems() != null ? request.getOrderItems().size() : 0));

        if (request.getOrderItems() != null) {
            System.out.println("--- Order Items Details ---");
            for (int i = 0; i < request.getOrderItems().size(); i++) {
                var item = request.getOrderItems().get(i);
                System.out.println("Item " + (i + 1) + ":");
                System.out.println("  Product ID: " + item.getProductId());
                System.out.println("  Barcode: " + item.getBarcode());
                System.out.println("  Quantity: " + item.getQuantity());
                System.out.println("  Unit Price: " + item.getUnitPrice());
            }
        }
        System.out.println("=====================================");

        PaymentIntentResponse response = paymentService.createPaymentIntent(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmationResponse> confirmPayment(
            @RequestBody PaymentConfirmationRequest request) {

        PaymentConfirmationResponse response = paymentService.confirmPayment(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Payment service is running!");
    }

    @PostMapping("/orders/all")
    public ResponseEntity<AllOrdersResponse> getAllOrdersByStatus(
            @RequestBody(required = false) OrderStatusRequest request) {
        String status = request != null ? request.getStatus() : null;
        AllOrdersResponse response = orderService.getAllOrdersByStatus(status);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderById(@PathVariable Long orderId) {
        OrderDetailResponse response = orderService.getOrderById(orderId);

        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all payments with order details
     * 
     * @return AllPaymentsResponse containing all payments
     */
    @GetMapping("/all")
    public ResponseEntity<AllPaymentsResponse> getAllPayments() {
        try {
            System.out.println("=== GETTING ALL PAYMENTS ===");

            AllPaymentsResponse response = paymentService.getAllPayments();

            if (response.isSuccess()) {
                System.out.println("✅ Successfully retrieved " + response.getTotalPayments() + " payments");
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Failed to retrieve payments: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("❌ Error in getAllPayments endpoint: " + e.getMessage());
            e.printStackTrace();

            AllPaymentsResponse errorResponse = AllPaymentsResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .payments(new java.util.ArrayList<>())
                    .totalPayments(0)
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}