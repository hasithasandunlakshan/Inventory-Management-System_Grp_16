package com.InventoryMangementSystem.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.InventoryMangementSystem.userservice.entity.User;

import java.util.Optional;

@Repository  // Optional here, but you can keep it for clarity
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
}
