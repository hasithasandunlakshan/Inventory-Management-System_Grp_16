package com.InventoryMangementSystem.userservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/secure")
@RequiredArgsConstructor
public class SecureController {

    private final UserService userService;

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
        System.out.println("  - userId (raw): " + userIdObj + " (type: "
                + (userIdObj != null ? userIdObj.getClass().getSimpleName() : "null") + ")");
        System.out.println("  - userId (converted): " + userId);
        System.out.println("  - email: " + email);
        System.out.println("  - role: " + role);

        String response = "UserId: " + userId + ", Email: " + email + ", Role: " + role;
        System.out.println("Response: " + response);
        System.out.println("=== SECURE PROFILE ENDPOINT COMPLETED ===\n");

        return response;
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserInfo> getUserDetails(@PathVariable Long id) {
        System.out.println("\n=== GET USER DETAILS ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Requested User ID: " + id);

        try {
            UserInfo userInfo = userService.getUserById(id);
            System.out.println("User details retrieved successfully for ID: " + id);
            System.out.println("=== GET USER DETAILS ENDPOINT COMPLETED ===\n");
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            System.err.println("Error getting user details: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== GET USER DETAILS ENDPOINT FAILED ===\n");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/current")
    public ResponseEntity<UserInfo> getCurrentUserDetails(HttpServletRequest request) {
        System.out.println("\n=== GET CURRENT USER DETAILS ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());

        try {
            // Extract user ID from JWT token attributes set by the filter
            Object userIdObj = request.getAttribute("userId");
            Long userId = null;
            if (userIdObj != null) {
                if (userIdObj instanceof Integer) {
                    userId = ((Integer) userIdObj).longValue();
                } else if (userIdObj instanceof Long) {
                    userId = (Long) userIdObj;
                }
            }

            if (userId == null) {
                System.err.println("User ID not found in request attributes");
                System.out.println("=== GET CURRENT USER DETAILS ENDPOINT FAILED ===\n");
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Current User ID: " + userId);
            UserInfo userInfo = userService.getUserById(userId);
            System.out.println("Current user details retrieved successfully");
            System.out.println("=== GET CURRENT USER DETAILS ENDPOINT COMPLETED ===\n");
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            System.err.println("Error getting current user details: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== GET CURRENT USER DETAILS ENDPOINT FAILED ===\n");
            return ResponseEntity.badRequest().build();
        }
    }
}
