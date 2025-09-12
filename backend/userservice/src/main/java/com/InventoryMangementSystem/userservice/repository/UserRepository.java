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

    // Find users by role name (case-insensitive) - returns full User objects
    @Query("SELECT u FROM User u JOIN u.roles ur JOIN ur.role r WHERE LOWER(r.roleName) = LOWER(:roleName)")
    List<User> findByRoleName(@Param("roleName") String roleName);

    // Find users by role name for dropdown - returns only userId and username
    @Query(value = "SELECT u.user_id, u.username FROM users u JOIN user_roles ur ON u.user_id = ur.user_id JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = :roleName", nativeQuery = true)
    List<Object[]> findUsersForDropdownByRole(@Param("roleName") String roleName);
}
