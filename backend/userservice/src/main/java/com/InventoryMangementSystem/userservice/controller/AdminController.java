package com.InventoryMangementSystem.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.InventoryMangementSystem.userservice.dto.RoleAssignmentRequest;
import com.InventoryMangementSystem.userservice.service.AdminService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
}
