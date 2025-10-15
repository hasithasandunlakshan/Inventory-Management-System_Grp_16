package com.InventoryMangementSystem.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.InventoryMangementSystem.userservice.dto.RoleAssignmentRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;

import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.repository.UserRoleRepository;

import com.InventoryMangementSystem.userservice.service.AdminService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @PostMapping("/assign-role")
    public ResponseEntity<Map<String, String>> assignRole(@RequestBody RoleAssignmentRequest request) {
        try {
            adminService.assignRoleToUser(request.getUserId(), request.getRoleName());
            return ResponseEntity.ok(Map.of(
                    "message", "Role assigned successfully",
                    "userId", request.getUserId().toString(),
                    "role", request.getRoleName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove-role")
    public ResponseEntity<Map<String, String>> removeRole(@RequestBody RoleAssignmentRequest request) {
        try {
            adminService.removeRoleFromUser(request.getUserId(), request.getRoleName());
            return ResponseEntity.ok(Map.of("message", "Role removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersWithRoles() {
        try {
            List<Map<String, Object>> users = adminService.getAllUsersWithRoles();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of(Map.of("error", e.getMessage())));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getAllAvailableRoles() {
        try {
            List<String> roles = adminService.getAllAvailableRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of("Error fetching roles"));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserInfo> getUserById(@PathVariable Long id) {

        System.out.println("\n=== ADMIN GET USER BY ID ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Requested userId: " + id);

        try {
            // Fetch user from database
            User user = userRepository.findById(id)
                    .orElse(null);

            if (user == null) {
                System.out.println("ERROR: User not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }

            // Get user roles
            List<UserRole> userRoles = userRoleRepository.findByUser(user);
            List<String> roleNames = userRoles.stream()
                    .map(ur -> ur.getRole().getRoleName())
                    .collect(Collectors.toList());

            // Get primary role (first role or empty string)
            String primaryRole = roleNames.isEmpty() ? "" : roleNames.get(0);

            // Create UserInfo DTO
            UserInfo userInfo = new UserInfo();
            userInfo.setId(user.getUserId().toString());
            userInfo.setUsername(user.getUsername());
            userInfo.setEmail(user.getEmail());
            userInfo.setFullName(user.getFullName());
            userInfo.setRole(primaryRole);
            userInfo.setPhoneNumber(user.getPhoneNumber());
            userInfo.setProfileImageUrl(user.getProfileImageUrl());
            userInfo.setLatitude(user.getLatitude());
            userInfo.setLongitude(user.getLongitude());
            userInfo.setFormattedAddress(user.getFormattedAddress());
            userInfo.setAccountStatus(user.getAccountStatus() != null ? user.getAccountStatus().toString() : null);
            userInfo.setEmailVerified(user.getEmailVerified());
            userInfo.setCreatedAt(user.getCreatedAt());
            userInfo.setDateOfBirth(user.getDateOfBirth());

            System.out.println("Successfully retrieved user info for: " + user.getUsername());
            System.out.println("User roles: " + roleNames);
            System.out.println("=== ADMIN GET USER BY ID ENDPOINT COMPLETED ===\n");

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            System.out.println("ERROR in admin getUserById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
