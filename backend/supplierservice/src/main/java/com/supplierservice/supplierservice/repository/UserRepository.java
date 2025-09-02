package com.supplierservice.supplierservice.repository;

import com.supplierservice.supplierservice.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Additional query methods can be added here as needed
}
