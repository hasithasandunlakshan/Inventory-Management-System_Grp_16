package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.DriverVehicleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverVehicleAssignmentRepository extends JpaRepository<DriverVehicleAssignment, Long> {
    
    // Find active assignment for a driver
    @Query("SELECT dva FROM DriverVehicleAssignment dva WHERE dva.driverId = :driverId AND dva.status = 'ACTIVE'")
    Optional<DriverVehicleAssignment> findActiveAssignmentByDriverId(@Param("driverId") Long driverId);
    
    // Find active assignment for a vehicle
    @Query("SELECT dva FROM DriverVehicleAssignment dva WHERE dva.vehicleId = :vehicleId AND dva.status = 'ACTIVE'")
    Optional<DriverVehicleAssignment> findActiveAssignmentByVehicleId(@Param("vehicleId") Long vehicleId);
    
    // Find all assignments for a driver
    List<DriverVehicleAssignment> findByDriverIdOrderByAssignedAtDesc(Long driverId);
    
    // Find all assignments for a vehicle
    List<DriverVehicleAssignment> findByVehicleIdOrderByAssignedAtDesc(Long vehicleId);
    
    // Find assignments by status
    List<DriverVehicleAssignment> findByStatusOrderByAssignedAtDesc(DriverVehicleAssignment.AssignmentStatus status);
    
    // Find all active assignments
    @Query("SELECT dva FROM DriverVehicleAssignment dva WHERE dva.status = 'ACTIVE' ORDER BY dva.assignedAt DESC")
    List<DriverVehicleAssignment> findAllActiveAssignments();
    
    // Find assignments within date range
    @Query("SELECT dva FROM DriverVehicleAssignment dva WHERE dva.assignedAt BETWEEN :startDate AND :endDate ORDER BY dva.assignedAt DESC")
    List<DriverVehicleAssignment> findAssignmentsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Count active assignments
    @Query("SELECT COUNT(dva) FROM DriverVehicleAssignment dva WHERE dva.status = 'ACTIVE'")
    long countActiveAssignments();
    
    // Check if driver has active assignment
    @Query("SELECT COUNT(dva) > 0 FROM DriverVehicleAssignment dva WHERE dva.driverId = :driverId AND dva.status = 'ACTIVE'")
    boolean hasActiveAssignment(@Param("driverId") Long driverId);
    
    // Check if vehicle has active assignment
    @Query("SELECT COUNT(dva) > 0 FROM DriverVehicleAssignment dva WHERE dva.vehicleId = :vehicleId AND dva.status = 'ACTIVE'")
    boolean vehicleHasActiveAssignment(@Param("vehicleId") Long vehicleId);
}
