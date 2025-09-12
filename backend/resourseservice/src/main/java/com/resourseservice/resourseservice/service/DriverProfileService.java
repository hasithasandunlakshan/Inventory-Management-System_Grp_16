package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.entity.DriverProfile;
import com.resourseservice.resourseservice.repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DriverProfileService {

    private final DriverProfileRepository driverProfileRepository;

    public DriverProfile createDriverProfile(DriverProfile driverProfile) {
        log.info("Creating driver profile for user ID: {}", driverProfile.getUserId());
        
        // Check if license number already exists
        if (driverProfileRepository.existsByLicenseNumber(driverProfile.getLicenseNumber())) {
            throw new RuntimeException("Driver with license number " + driverProfile.getLicenseNumber() + " already exists");
        }
        
        // Check if user already has a driver profile
        if (driverProfileRepository.findByUserId(driverProfile.getUserId()).isPresent()) {
            throw new RuntimeException("Driver profile for user ID " + driverProfile.getUserId() + " already exists");
        }
        
        return driverProfileRepository.save(driverProfile);
    }

    @Transactional(readOnly = true)
    public List<DriverProfile> getAllDriverProfiles() {
        log.info("Fetching all driver profiles");
        return driverProfileRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<DriverProfile> getDriverProfileById(Long driverId) {
        log.info("Fetching driver profile with ID: {}", driverId);
        return driverProfileRepository.findById(driverId);
    }

    @Transactional(readOnly = true)
    public Optional<DriverProfile> getDriverProfileByUserId(Long userId) {
        log.info("Fetching driver profile for user ID: {}", userId);
        return driverProfileRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<DriverProfile> getAvailableDrivers() {
        log.info("Fetching available drivers");
        return driverProfileRepository.findAvailableDrivers();
    }

    public DriverProfile updateDriverProfile(Long driverId, DriverProfile updatedProfile) {
        log.info("Updating driver profile with ID: {}", driverId);
        
        DriverProfile existingProfile = driverProfileRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found with ID: " + driverId));
        
        // Update fields
        if (updatedProfile.getLicenseNumber() != null) {
            existingProfile.setLicenseNumber(updatedProfile.getLicenseNumber());
        }
        if (updatedProfile.getLicenseClass() != null) {
            existingProfile.setLicenseClass(updatedProfile.getLicenseClass());
        }
        if (updatedProfile.getLicenseExpiry() != null) {
            existingProfile.setLicenseExpiry(updatedProfile.getLicenseExpiry());
        }
        if (updatedProfile.getAvailabilityStatus() != null) {
            existingProfile.setAvailabilityStatus(updatedProfile.getAvailabilityStatus());
        }
        if (updatedProfile.getEmergencyContact() != null) {
            existingProfile.setEmergencyContact(updatedProfile.getEmergencyContact());
        }
        if (updatedProfile.getAddress() != null) {
            existingProfile.setAddress(updatedProfile.getAddress());
        }
        
        return driverProfileRepository.save(existingProfile);
    }

    public void deleteDriverProfile(Long driverId) {
        log.info("Deleting driver profile with ID: {}", driverId);
        
        if (!driverProfileRepository.existsById(driverId)) {
            throw new RuntimeException("Driver profile not found with ID: " + driverId);
        }
        
        driverProfileRepository.deleteById(driverId);
    }
}
