package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {

    // Find driver by user ID (from UserService)
    Optional<DriverProfile> findByUserId(Long userId);

    // Find drivers by availability status
    List<DriverProfile> findByAvailabilityStatus(DriverProfile.AvailabilityStatus status);

    // Find available drivers (not assigned to any vehicle or assigned but
    // available)
    @Query("SELECT dp FROM DriverProfile dp WHERE dp.availabilityStatus = 'AVAILABLE'")
    List<DriverProfile> findAvailableDrivers();

    // Find drivers assigned to a specific vehicle
    List<DriverProfile> findByAssignedVehicleId(Long vehicleId);

    // Check if license number already exists
    boolean existsByLicenseNumber(String licenseNumber);

    // Find driver by license number
    Optional<DriverProfile> findByLicenseNumber(String licenseNumber);

    // Count drivers by status
    @Query("SELECT COUNT(dp) FROM DriverProfile dp WHERE dp.availabilityStatus = :status")
    long countByAvailabilityStatus(@Param("status") DriverProfile.AvailabilityStatus status);

    // Find drivers with vehicles assigned
    @Query("SELECT dp FROM DriverProfile dp WHERE dp.assignedVehicleId IS NOT NULL")
    List<DriverProfile> findDriversWithAssignedVehicles();

    // Get available drivers with their vehicle details in one query
    @Query(value = "SELECT a.assignment_id, dp.user_id, u.full_name, v.vehicle_type " +
            "FROM driver_profiles dp " +
            "INNER JOIN assignments a ON dp.driver_id = a.driver_id " +
            "INNER JOIN vehicles v ON a.vehicle_id = v.vehicle_id " +
            "INNER JOIN users u ON dp.user_id = u.user_id " +
            "WHERE dp.availability_status = 'AVAILABLE' " +
            "AND a.status = 'ACTIVE'", nativeQuery = true)
    List<Object[]> findAvailableDriversWithVehicles();
}
