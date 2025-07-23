package com.InventoryMangementSystem.userservice.repository;

import com.InventoryMangementSystem.userservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {}