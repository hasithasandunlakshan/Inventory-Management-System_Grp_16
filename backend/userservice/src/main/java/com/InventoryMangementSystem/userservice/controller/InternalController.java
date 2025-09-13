package com.InventoryMangementSystem.userservice.controller;

import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API Controller for service-to-service communication
 * This controller provides endpoints that can be called by other microservices
 * without requiring user authentication
 */
@RestController
@RequestMapping("/api/internal")
@CrossOrigin(origins = "*")
public class InternalController {

    @Autowired
    private UserService userService;

    @GetMapping("/user/{id}")
    public ResponseEntity<UserInfo> getUserById(@PathVariable Long id) {
        System.out.println("\n=== INTERNAL GET USER BY ID ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Requested userId: " + id);

        try {
            UserInfo user = userService.getUserById(id);
            if (user != null) {
                System.out.println("User found: " + user.getUsername());
                System.out.println("User address: " + user.getFormattedAddress());
                System.out.println("User coordinates: " + user.getLatitude() + ", " + user.getLongitude());
                return ResponseEntity.ok(user);
            } else {
                System.out.println("User not found for ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching user by ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
