package com.InventoryMangementSystem.userservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.dto.UserDropdownDto;
import com.InventoryMangementSystem.userservice.service.UserService;

import java.util.List;

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

    public ResponseEntity<Map<String, Object>> getAllUsersWithUserRole() {
        System.out.println("\n=== GET ALL USERS WITH USER ROLE REQUEST RECEIVED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        
        try {
            System.out.println("Calling UserService.getUsersByRole with role: USER");
            List<UserInfo> users = userService.getUsersByRole("USER");
            
            // Create response map
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Users with role 'USER' retrieved successfully");
            response.put("users", users);
            response.put("totalUsers", users.size());
            
            System.out.println("Successfully retrieved " + users.size() + " users with USER role");
            System.out.println("=== GET ALL USERS WITH USER ROLE REQUEST COMPLETED ===\n");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("ERROR during get users request: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== GET ALL USERS WITH USER ROLE REQUEST FAILED ===\n");
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve users: " + e.getMessage());
            errorResponse.put("users", List.of());
            errorResponse.put("totalUsers", 0);
            
            return ResponseEntity.status(500).body(errorResponse);

    public ResponseEntity<List<UserInfo>> getUsersByRole(@RequestParam(defaultValue = "USER") String role) {
        try {
            List<UserInfo> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("ERROR getting users by role: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/users/dropdown")
    public ResponseEntity<List<UserDropdownDto>> getUsersForDropdown(@RequestParam(defaultValue = "USER") String role) {
        try {
            System.out.println("🔍 Getting users for dropdown with role: " + role);
            List<UserDropdownDto> users = userService.getUsersForDropdown(role);
            System.out.println("🔍 Found " + users.size() + " users for dropdown");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("ERROR getting users for dropdown: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();

        }
    }

}
