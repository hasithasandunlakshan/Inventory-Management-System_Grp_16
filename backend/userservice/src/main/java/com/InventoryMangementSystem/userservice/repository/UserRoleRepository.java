package com.InventoryMangementSystem.userservice.repository;

import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findByUser(User user);

    @Modifying
    @Query(value = "UPDATE user_roles SET role_id = :roleId WHERE user_id = :userId", nativeQuery = true)
    void updateUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);
}