package com.InventoryMangementSystem.userservice.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.security.JwtTokenUtil;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
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
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setFormattedAddress(request.getFormattedAddress());

        // Optional: Set other fields like status or createdAt if needed (defaults are handled in entity)

        userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return new LoginResponse(false, "Invalid credentials");
            }

            // Check if user has roles, if not assign a default role
            String role = "USER"; // Default role
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                role = user.getRoles().get(0).getRole().getRoleName();
            }
            
            String token = jwtTokenUtil.generateToken(user.getUserId(), user.getEmail(), role);
            
            // Create user info
            UserInfo userInfo = new UserInfo(
                user.getUserId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName()
            );
            
            return new LoginResponse(true, token, userInfo, "Login successful");
            
        } catch (Exception e) {
            return new LoginResponse(false, "Login failed: " + e.getMessage());
        }
    }
}
