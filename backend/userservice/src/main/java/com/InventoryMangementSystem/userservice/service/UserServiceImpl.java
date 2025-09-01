package com.InventoryMangementSystem.userservice.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.Role;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.repository.RoleRepository;
import com.InventoryMangementSystem.userservice.repository.UserRoleRepository;
import com.InventoryMangementSystem.userservice.security.JwtTokenUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    @Transactional
    public void registerUser(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());

        // Profile image and location details
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        user.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        user.setFormattedAddress(request.getFormattedAddress());

        // Save user first
        user = userRepository.save(user);

        // Assign default USER role to all new users
        Role defaultRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("USER");
                    return roleRepository.save(newRole);
                });

        // Create user-role association
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(defaultRole);
        userRoleRepository.save(userRole);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return new LoginResponse(false, "Invalid credentials");
            }

            // Get user roles and determine the highest priority role
            String role = "USER"; // Default role
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                // Priority order: ADMIN > MANAGER > Store Keeper > USER
                String[] rolePriority = { "ADMIN", "MANAGER", "Store Keeper", "USER" };

                for (String priorityRole : rolePriority) {
                    boolean hasRole = user.getRoles().stream()
                            .anyMatch(ur -> priorityRole.equals(ur.getRole().getRoleName()));
                    if (hasRole) {
                        role = priorityRole;
                        break;
                    }
                }
            }

            String token = jwtTokenUtil.generateToken(user.getUserId(), user.getEmail(), role);

            // Create user info with all user attributes
            UserInfo userInfo = new UserInfo(
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

            return new LoginResponse(true, token, userInfo, "Login successful");

        } catch (Exception e) {
            return new LoginResponse(false, "Login failed: " + e.getMessage());
        }
    }
}
