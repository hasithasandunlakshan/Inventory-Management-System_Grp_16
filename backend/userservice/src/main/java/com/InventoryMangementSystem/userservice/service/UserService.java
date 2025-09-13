package com.InventoryMangementSystem.userservice.service;

import java.util.List;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;

public interface UserService {
    void registerUser(SignupRequest request);

    LoginResponse login(LoginRequest request);

    UserInfo getUserById(Long userId);

    List<UserInfo> searchUsers(String searchTerm);

    List<UserInfo> getAllUsers();
    
    List<UserInfo> getUsersByRole(String roleName);
}
