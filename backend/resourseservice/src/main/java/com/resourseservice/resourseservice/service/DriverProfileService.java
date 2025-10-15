package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.dto.DriverProfileCreatedEvent;
import com.resourseservice.resourseservice.dto.DriverRegistrationRequest;
import com.resourseservice.resourseservice.dto.DriverWithVehicleResponse;
import com.resourseservice.resourseservice.entity.DriverProfile;
import com.resourseservice.resourseservice.entity.Assignment;
import com.resourseservice.resourseservice.entity.Vehicle;
import com.resourseservice.resourseservice.repository.DriverProfileRepository;
import com.resourseservice.resourseservice.repository.AssignmentRepository;
import com.resourseservice.resourseservice.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DriverProfileService {

    private final DriverProfileRepository driverProfileRepository;
    private final AssignmentRepository assignmentRepository;
    private final VehicleRepository vehicleRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DriverProfile registerDriver(DriverRegistrationRequest request) {
        log.info("Registering driver profile for user ID: {}", request.getUserId());

        // Check if license number already exists
        if (driverProfileRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new RuntimeException("Driver with license number " + request.getLicenseNumber() + " already exists");
        }

        // Check if user already has a driver profile
        if (driverProfileRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new RuntimeException("Driver profile for user ID " + request.getUserId() + " already exists");
        }

        // Create new driver profile
        DriverProfile driverProfile = new DriverProfile();
        driverProfile.setUserId(request.getUserId());
        driverProfile.setLicenseNumber(request.getLicenseNumber());
        driverProfile.setLicenseClass(request.getLicenseClass());
        driverProfile.setLicenseExpiry(request.getLicenseExpiry());
        driverProfile.setEmergencyContact(request.getEmergencyContact());
        driverProfile.setAvailabilityStatus(DriverProfile.AvailabilityStatus.AVAILABLE);

        DriverProfile savedProfile = driverProfileRepository.save(driverProfile);
        log.info("Successfully registered driver profile with ID: {} for user ID: {}",
                savedProfile.getDriverId(), savedProfile.getUserId());

        // Publish Kafka event for role assignment
        try {
            DriverProfileCreatedEvent event = new DriverProfileCreatedEvent(request.getUserId());
            kafkaTemplate.send("driver-profile-created-events", event);
            log.info("Published DriverProfileCreated event for user ID: {}", request.getUserId());
        } catch (Exception e) {
            log.error("Failed to publish DriverProfileCreated event for user ID: {}: {}",
                    request.getUserId(), e.getMessage());
            // Don't throw exception - driver profile is created successfully
        }

        return savedProfile;
    }

    public DriverProfile createDriverProfile(DriverProfile driverProfile) {
        log.info("Creating driver profile for user ID: {}", driverProfile.getUserId());

        // Check if license number already exists
        if (driverProfileRepository.existsByLicenseNumber(driverProfile.getLicenseNumber())) {
            throw new RuntimeException(
                    "Driver with license number " + driverProfile.getLicenseNumber() + " already exists");
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

        return driverProfileRepository.save(existingProfile);
    }

    public void deleteDriverProfile(Long driverId) {
        log.info("Deleting driver profile with ID: {}", driverId);

        if (!driverProfileRepository.existsById(driverId)) {
            throw new RuntimeException("Driver profile not found with ID: " + driverId);
        }

        driverProfileRepository.deleteById(driverId);
    }

    @Transactional(readOnly = true)
    public List<DriverWithVehicleResponse> getAvailableDriversWithVehicles() {
        log.info("Fetching available drivers with their vehicles using optimized single query");

        // Single optimized query with JOIN
        List<Object[]> results = driverProfileRepository.findAvailableDriversWithVehicles();

        return results.stream()
                .map(row -> DriverWithVehicleResponse.builder()
                        .assignmentId(((Number) row[0]).longValue())
                        .userId(((Number) row[1]).longValue())
                        .driverName((String) row[2]) // Username from users table
                        .vehicleType((String) row[3])
                        .build())
                .collect(Collectors.toList());
    }
}
