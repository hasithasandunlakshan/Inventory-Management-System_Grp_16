package com.InventoryMangementSystem.userservice.service;

import com.InventoryMangementSystem.userservice.dto.LoginRequest;
import com.InventoryMangementSystem.userservice.dto.LoginResponse;
import com.InventoryMangementSystem.userservice.dto.SignupRequest;

public interface UserService {
    void registerUser(SignupRequest request);
    LoginResponse login(LoginRequest request);
}
