package com.InventoryMangementSystem.userservice.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.Role;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.repository.RoleRepository;
import com.InventoryMangementSystem.userservice.repository.UserRoleRepository;
import com.InventoryMangementSystem.userservice.service.AdminService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public void assignRoleToUser(Long userId, String roleName) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Find or create role
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName(roleName);
                    return roleRepository.save(newRole);
                });

        // Check if user already has this role
        List<UserRole> existingUserRoles = userRoleRepository.findByUser(user);
        boolean hasRole = existingUserRoles.stream()
                .anyMatch(ur -> ur.getRole().getRoleName().equals(roleName));

        if (hasRole) {
            throw new RuntimeException("User already has role: " + roleName);
        }

        // Create user-role association
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);
    }

    @Override
    @Transactional
    public void removeRoleFromUser(Long userId, String roleName) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Find existing user roles
        List<UserRole> userRoles = userRoleRepository.findByUser(user);
        UserRole roleToRemove = userRoles.stream()
                .filter(ur -> ur.getRole().getRoleName().equals(roleName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User does not have role: " + roleName));

        userRoleRepository.delete(roleToRemove);
    }

    @Override
    public List<Map<String, Object>> getAllUsersWithRoles() {
        List<User> users = userRepository.findAll();

        return users.stream().map(user -> {
            List<UserRole> userRoles = userRoleRepository.findByUser(user);
            List<String> roleNames = userRoles.stream()
                    .map(ur -> ur.getRole().getRoleName())
                    .collect(Collectors.toList());

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("fullName", user.getFullName());
            userInfo.put("roles", roleNames);
            userInfo.put("accountStatus", user.getAccountStatus());
            userInfo.put("createdAt", user.getCreatedAt());

            return userInfo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<String> getAllAvailableRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());
    }

    @Override
    public UserInfo getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Get user roles and determine the highest priority role
        String role = "USER"; // Default role
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            // Priority order: ADMIN > MANAGER > Store Keeper > DRIVER > USER
            String[] rolePriority = { "ADMIN", "MANAGER", "Store Keeper", "DRIVER", "USER" };

            for (String priorityRole : rolePriority) {
                boolean hasRole = user.getRoles().stream()
                        .anyMatch(ur -> priorityRole.equals(ur.getRole().getRoleName()));
                if (hasRole) {
                    role = priorityRole;
                    break;
                }
            }
        }

        // Create and return UserInfo with all user attributes
        return new UserInfo(
                user.getUserId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                role,
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getLatitude(),
                user.getLongitude(),
                user.getFormattedAddress(),
                user.getAccountStatus() != null ? user.getAccountStatus().name() : null,
                user.getEmailVerified(),
                user.getCreatedAt(),
                user.getDateOfBirth());
    }
}
