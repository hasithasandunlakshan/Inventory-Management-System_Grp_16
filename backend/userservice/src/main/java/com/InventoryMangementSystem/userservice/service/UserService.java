package com.InventoryMangementSystem.userservice.service;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;
import com.InventoryMangementSystem.userservice.dto.UserInfo;
import com.InventoryMangementSystem.userservice.dto.UserDropdownDto;

import java.util.List;

public interface UserService {
    void registerUser(SignupRequest request);

    LoginResponse login(LoginRequest request);

    UserInfo getUserById(Long userId);

    List<UserInfo> searchUsers(String searchTerm);

    List<UserInfo> getAllUsers();
    
    List<UserInfo> getUsersByRole(String role);
    
    List<UserDropdownDto> getUsersForDropdown(String role);
}
