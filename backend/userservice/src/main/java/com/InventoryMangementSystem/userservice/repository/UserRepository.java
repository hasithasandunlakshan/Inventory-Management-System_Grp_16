package com.InventoryMangementSystem.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.InventoryMangementSystem.userservice.entity.User;

import java.util.List;
import java.util.Optional;

@Repository // Optional here, but you can keep it for clarity
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);

    // Search methods for user lookup
    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
            String username, String email, String fullName);

    List<User> findByUsernameContainingIgnoreCase(String username);

    List<User> findByEmailContainingIgnoreCase(String email);

    List<User> findByFullNameContainingIgnoreCase(String fullName);
    
    // Find users by role name (case-insensitive)
    @Query("SELECT u FROM User u JOIN u.roles ur JOIN ur.role r WHERE LOWER(r.roleName) = LOWER(:roleName)")
    List<User> findByRoleName(@Param("roleName") String roleName);
}
