package com.InventoryMangementSystem.userservice.service;

import java.util.List;
import java.util.Map;

import com.InventoryMangementSystem.userservice.dto.UserInfo;

public interface AdminService {
    void assignRoleToUser(Long userId, String roleName);

    void removeRoleFromUser(Long userId, String roleName);

    void updateUserRole(Long userId, String newRoleName);

    List<Map<String, Object>> getAllUsersWithRoles();

    List<String> getAllAvailableRoles();

    UserInfo getUserById(Long userId);
}
