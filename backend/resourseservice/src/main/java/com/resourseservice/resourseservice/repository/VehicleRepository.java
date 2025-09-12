package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    // Find vehicle by vehicle number
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    
    // Find vehicles by status
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
    
    // Find available vehicles
    @Query("SELECT v FROM Vehicle v WHERE v.status = 'AVAILABLE'")
    List<Vehicle> findAvailableVehicles();
    
    // Find vehicles by type
    List<Vehicle> findByVehicleType(Vehicle.VehicleType vehicleType);
    
    // Find vehicles by type and status
    List<Vehicle> findByVehicleTypeAndStatus(Vehicle.VehicleType vehicleType, Vehicle.VehicleStatus status);
    
    // Find vehicle assigned to specific driver
    Optional<Vehicle> findByAssignedDriverId(Long driverId);
    
    // Check if vehicle number already exists
    boolean existsByVehicleNumber(String vehicleNumber);
    
    // Count vehicles by status
    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = :status")
    long countByStatus(@Param("status") Vehicle.VehicleStatus status);
    
    // Find vehicles requiring maintenance (next maintenance date passed)
    @Query("SELECT v FROM Vehicle v WHERE v.nextMaintenance <= :currentDate AND v.status != 'MAINTENANCE'")
    List<Vehicle> findVehiclesRequiringMaintenance(@Param("currentDate") LocalDate currentDate);
    
    // Find vehicles assigned to drivers
    @Query("SELECT v FROM Vehicle v WHERE v.assignedDriverId IS NOT NULL")
    List<Vehicle> findAssignedVehicles();
}
