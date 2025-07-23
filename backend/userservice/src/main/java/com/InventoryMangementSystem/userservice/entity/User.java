package com.InventoryMangementSystem.userservice.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;
    private String phoneNumber;
    private String profileImageUrl;

    private double latitude;
    private double longitude;
    private String formattedAddress;

    @Convert(converter = AccountStatusConverter.class)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    private Boolean emailVerified = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDate dateOfBirth;

    @OneToMany(mappedBy = "user")
    private List<UserRole> roles;
}
