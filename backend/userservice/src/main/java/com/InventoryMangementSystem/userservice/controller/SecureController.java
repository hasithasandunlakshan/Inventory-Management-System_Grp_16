package com.InventoryMangementSystem.userservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.repository.UserRoleRepository;

import java.util.List;
import java.util.stream.Collectors;

import com.InventoryMangementSystem.userservice.service.UserService;

@RestController
@RequestMapping("/api/secure")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class SecureController {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
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
        if (userIdObj == null) {
            // Try getting from headers set by API Gateway
            String userIdHeader = request.getHeader("X-User-Id");
            if (userIdHeader != null) {
                userIdObj = Long.parseLong(userIdHeader);
            }
        }

        Long userId = null;
        if (userIdObj != null) {
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            }
        }

        String email = (String) request.getAttribute("email");
        if (email == null) {
            email = request.getHeader("X-User-Email");
        }

        String role = (String) request.getAttribute("role");

        if (role == null) {
            role = request.getHeader("X-User-Roles");
        }

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

    @GetMapping("/user/current")
    public ResponseEntity<UserInfo> getCurrentUser(HttpServletRequest request) {
        try {
            // Handle potential Integer to Long conversion for userId
            // First try to get from request attributes (direct access), then from headers
            // (via API Gateway)
            Object userIdObj = request.getAttribute("userId");
            if (userIdObj == null) {
                // Try getting from headers set by API Gateway
                String userIdHeader = request.getHeader("X-User-Id");
                if (userIdHeader != null) {
                    userIdObj = Long.parseLong(userIdHeader);
                }
            }

            Long userId = null;
            if (userIdObj != null) {
                if (userIdObj instanceof Integer) {
                    userId = ((Integer) userIdObj).longValue();
                } else if (userIdObj instanceof Long) {
                    userId = (Long) userIdObj;
                }
            }

            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }

            final Long finalUserId = userId; // Make final for lambda

            // Fetch user from database
            User user = userRepository.findById(finalUserId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + finalUserId));

            // Get user roles
            List<UserRole> userRoles = userRoleRepository.findByUser(user);
            List<String> roleNames = userRoles.stream()
                    .map(ur -> ur.getRole().getRoleName())
                    .collect(Collectors.toList());

            // Get primary role using same logic as login
            String primaryRole = "USER"; // Default role
            if (!userRoles.isEmpty()) {
                // Priority order: ADMIN > MANAGER > Store Keeper > USER
                String[] rolePriority = { "ADMIN", "MANAGER", "Store Keeper", "USER" };

                for (String priorityRole : rolePriority) {
                    boolean hasRole = userRoles.stream()
                            .anyMatch(ur -> priorityRole.equalsIgnoreCase(ur.getRole().getRoleName()));
                    if (hasRole) {
                        primaryRole = priorityRole;
                        break;
                    }
                }
            }

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

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserInfo> getUserById(@PathVariable Long id, HttpServletRequest request) {
        System.out.println("\n=== SECURE GET USER BY ID ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Requested userId: " + id);

        try {
            // Get current user's ID from JWT token
            // First try to get from request attributes (direct access), then from headers
            // (via API Gateway)
            Object currentUserIdObj = request.getAttribute("userId");
            if (currentUserIdObj == null) {
                // Try getting from headers set by API Gateway
                String userIdHeader = request.getHeader("X-User-Id");
                if (userIdHeader != null) {
                    currentUserIdObj = Long.parseLong(userIdHeader);
                }
            }

            Long currentUserId = null;
            if (currentUserIdObj != null) {
                if (currentUserIdObj instanceof Integer) {
                    currentUserId = ((Integer) currentUserIdObj).longValue();
                } else if (currentUserIdObj instanceof Long) {
                    currentUserId = (Long) currentUserIdObj;
                }
            }

            // Get current user role
            String currentUserRole = (String) request.getAttribute("role");
            if (currentUserRole == null) {
                currentUserRole = request.getHeader("X-User-Roles");
            }

            // Basic access control: users can only access their own info via secure
            // endpoint
            // unless they have elevated privileges
            if (currentUserId == null) {
                System.out.println("ERROR: No current userId found in request attributes or headers");
                return ResponseEntity.badRequest().build();
            }

            // Allow access if:
            // 1. User is requesting their own info
            // 2. User has ADMIN, MANAGER, or Store Keeper role (for supplier management)
            boolean hasAccess = currentUserId.equals(id) ||
                    (currentUserRole != null &&
                            (currentUserRole.contains("ADMIN") ||
                                    currentUserRole.contains("MANAGER") ||
                                    currentUserRole.contains("Store Keeper")));

            if (!hasAccess) {
                System.out.println("ACCESS DENIED: User " + currentUserId + " with role " + currentUserRole +
                        " cannot access user " + id);
                return ResponseEntity.status(403).build();
            }

            System.out.println("ACCESS GRANTED: User " + currentUserId + " with role " + currentUserRole +
                    " can access user " + id);

            // Fetch user from database
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

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
            System.out.println("=== SECURE GET USER BY ID ENDPOINT COMPLETED ===\n");

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            System.out.println("ERROR in getUserById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<UserInfo>> searchUsers(@RequestParam String query, HttpServletRequest request) {
        System.out.println("\n=== SECURE SEARCH USERS ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        System.out.println("Search query: " + query);

        try {
            // Get current user role for access control
            String currentUserRole = (String) request.getAttribute("role");
            if (currentUserRole == null) {
                currentUserRole = request.getHeader("X-User-Roles");
            }

            // Only allow ADMIN, MANAGER, or Store Keeper to search users
            boolean hasAccess = currentUserRole != null &&
                    (currentUserRole.contains("ADMIN") ||
                            currentUserRole.contains("MANAGER") ||
                            currentUserRole.contains("Store Keeper"));

            if (!hasAccess) {
                System.out.println("ACCESS DENIED: User with role " + currentUserRole +
                        " cannot search users");
                return ResponseEntity.status(403).build();
            }

            System.out.println("ACCESS GRANTED: User with role " + currentUserRole +
                    " can search users");

            List<UserInfo> users = userService.searchUsers(query);
            System.out.println("Search returned " + users.size() + " users");
            System.out.println("=== SECURE SEARCH USERS ENDPOINT COMPLETED ===\n");

            return ResponseEntity.ok(users);

        } catch (Exception e) {
            System.err.println("ERROR in searchUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserInfo>> getAllUsers(HttpServletRequest request) {
        System.out.println("\n=== SECURE GET ALL USERS ENDPOINT CALLED ===");
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());

        try {
            // Get current user role for access control
            String currentUserRole = (String) request.getAttribute("role");
            if (currentUserRole == null) {
                currentUserRole = request.getHeader("X-User-Roles");
            }

            // Only allow ADMIN, MANAGER, or Store Keeper to get all users
            boolean hasAccess = currentUserRole != null &&
                    (currentUserRole.contains("ADMIN") ||
                            currentUserRole.contains("MANAGER") ||
                            currentUserRole.contains("Store Keeper"));

            if (!hasAccess) {
                System.out.println("ACCESS DENIED: User with role " + currentUserRole +
                        " cannot access all users");
                return ResponseEntity.status(403).build();
            }

            System.out.println("ACCESS GRANTED: User with role " + currentUserRole +
                    " can access all users");

            List<UserInfo> users = userService.getAllUsers();
            System.out.println("Retrieved " + users.size() + " total users");
            System.out.println("=== SECURE GET ALL USERS ENDPOINT COMPLETED ===\n");

            return ResponseEntity.ok(users);

        } catch (Exception e) {
            System.err.println("ERROR in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }

    public UserRoleRepository getUserRoleRepository() {
        return userRoleRepository;
    }

    public UserService getUserService() {
        return userService;
    }
}
