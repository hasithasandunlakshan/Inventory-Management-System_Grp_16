package com.InventoryMangementSystem.userservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure")
public class SecureController {

    @GetMapping("/profile")
    public String getProfile(HttpServletRequest request) {
        System.out.println("\n=== SECURE PROFILE ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());
        System.out.println("Authorization Header: " + request.getHeader("Authorization"));
        
        // Handle potential Integer to Long conversion
        Object userIdObj = request.getAttribute("userId");
        Long userId = null;
        if (userIdObj != null) {
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            }
        }
        
        String email = (String) request.getAttribute("email");
        String role = (String) request.getAttribute("role");
        
        System.out.println("Extracted Attributes from Request:");
        System.out.println("  - userId (raw): " + userIdObj + " (type: " + (userIdObj != null ? userIdObj.getClass().getSimpleName() : "null") + ")");
        System.out.println("  - userId (converted): " + userId);
        System.out.println("  - email: " + email);
        System.out.println("  - role: " + role);
        
        String response = "UserId: " + userId + ", Email: " + email + ", Role: " + role;
        System.out.println("Response: " + response);
        System.out.println("=== SECURE PROFILE ENDPOINT COMPLETED ===\n");
        
        return response;
    }
}
