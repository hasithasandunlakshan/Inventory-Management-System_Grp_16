package com.Orderservice.Orderservice.controller;

import com.Orderservice.Orderservice.dto.*;
import com.Orderservice.Orderservice.service.PaymentService;
import com.Orderservice.Orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired  // Make sure this annotation is present
    private OrderService orderService;
    
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request) {
        
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
    
    @GetMapping("/orders/all")
    public ResponseEntity<AllOrdersResponse> getAllOrders() {
        AllOrdersResponse response = orderService.getAllOrders();

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
}