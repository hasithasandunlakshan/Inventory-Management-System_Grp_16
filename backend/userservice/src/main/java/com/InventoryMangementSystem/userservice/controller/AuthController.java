package com.InventoryMangementSystem.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest signupRequest) {
    System.out.println("\n=== SIGNUP REQUEST RECEIVED ===");
    System.out.println("Timestamp: " + java.time.LocalDateTime.now());
    System.out.println("Request Details:");
    System.out.println("  Username: " + signupRequest.getUsername());
    System.out.println("  Email: " + signupRequest.getEmail());
    System.out.println("  Full Name: " + signupRequest.getFullName());
    System.out.println("  Phone Number: " + signupRequest.getPhoneNumber());
    System.out.println("  Date of Birth: " + signupRequest.getDateOfBirth());
    System.out.println("  Profile Image URL: " + signupRequest.getProfileImageUrl());
    System.out.println("  Location - Lat: " + signupRequest.getLatitude() + ", Long: " + signupRequest.getLongitude());
    System.out.println("  Formatted Address: " + signupRequest.getFormattedAddress());
    System.out.println("  Password Length: " + (signupRequest.getPassword() != null ? signupRequest.getPassword().length() : "null"));
    
    try {
        System.out.println("Calling UserService.registerUser...");
        userService.registerUser(signupRequest);
        System.out.println("User registration completed successfully");
        System.out.println("=== SIGNUP REQUEST COMPLETED ===\n");
        return ResponseEntity.ok("User registered successfully");
    } catch (Exception e) {
        System.err.println("ERROR during signup: " + e.getMessage());
        e.printStackTrace();
        System.out.println("=== SIGNUP REQUEST FAILED ===\n");
        throw e;
    }
}

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        System.out.println("\n=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Username: " + request.getUsername());
        System.out.println("Password Length: " + (request.getPassword() != null ? request.getPassword().length() : "null"));
        
        try {
            System.out.println("Calling UserService.login...");
            LoginResponse response = userService.login(request);
            
            if (response.isSuccess()) {
                System.out.println("Login successful. Token generated: " + 
                    (response.getToken() != null ? response.getToken().substring(0, Math.min(20, response.getToken().length())) + "..." : "null"));
                System.out.println("User info: " + response.getUser());
                System.out.println("=== LOGIN REQUEST COMPLETED ===\n");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Login failed: " + response.getError());
                System.out.println("=== LOGIN REQUEST FAILED ===\n");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            System.err.println("ERROR during login: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== LOGIN REQUEST FAILED ===\n");
            LoginResponse errorResponse = new LoginResponse(false, "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserInfo>> getUsersByRole(@RequestParam(defaultValue = "USER") String role) {
        try {
            List<UserInfo> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("ERROR getting users by role: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

}
