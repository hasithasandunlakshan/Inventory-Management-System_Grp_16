package com.InventoryMangementSystem.userservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.InventoryMangementSystem.userservice.entity.User;
import com.InventoryMangementSystem.userservice.entity.Role;
import com.InventoryMangementSystem.userservice.entity.UserRole;
import com.InventoryMangementSystem.userservice.repository.UserRepository;
import com.InventoryMangementSystem.userservice.repository.RoleRepository;
import com.InventoryMangementSystem.userservice.repository.UserRoleRepository;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeRoles();
        upgradeAdminUser();
    }

    private void initializeRoles() {
        String[] roles = { "USER", "ADMIN", "MANAGER", "Store Keeper", "DRIVER" };

        for (String roleName : roles) {
            Optional<Role> existingRole = roleRepository.findByRoleName(roleName);
            if (existingRole.isEmpty()) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }
    }

    private void upgradeAdminUser() {
        Optional<User> adminUser = userRepository.findByUsername("admin");
        if (adminUser.isPresent()) {
            User user = adminUser.get();

            // Check if admin already has ADMIN role
            List<UserRole> existingRoles = userRoleRepository.findByUser(user);
            boolean hasAdminRole = existingRoles.stream()
                    .anyMatch(ur -> "ADMIN".equals(ur.getRole().getRoleName()));

            if (!hasAdminRole) {
                Role adminRole = roleRepository.findByRoleName("ADMIN")
                        .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

                UserRole userRole = new UserRole();
                userRole.setUser(user);
                userRole.setRole(adminRole);
                userRoleRepository.save(userRole);

                log.info("Upgraded user '{}' to ADMIN role", user.getUsername());
            } else {
                log.info("User '{}' already has ADMIN role", user.getUsername());
            }
        } else {
            log.warn("Admin user not found. Please create an admin user first.");
        }
    }
}
