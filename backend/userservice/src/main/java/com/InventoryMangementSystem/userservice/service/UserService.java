package com.InventoryMangementSystem.userservice.service;

import com.InventoryMangementSystem.userservice.dto.SignupRequest;

public interface UserService {
    void registerUser(SignupRequest request);
}
