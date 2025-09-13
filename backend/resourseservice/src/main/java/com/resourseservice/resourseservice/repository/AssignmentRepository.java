package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    // Find active assignments for a driver
    @Query("SELECT a FROM Assignment a WHERE a.driverId = :driverId AND a.status = 'ACTIVE'")
    Optional<Assignment> findActiveAssignmentByDriverId(@Param("driverId") Long driverId);

    // Find active assignments for a vehicle
    @Query("SELECT a FROM Assignment a WHERE a.vehicleId = :vehicleId AND a.status = 'ACTIVE'")
    Optional<Assignment> findActiveAssignmentByVehicleId(@Param("vehicleId") Long vehicleId);

    // Find all assignments for a driver (active and inactive)
    List<Assignment> findByDriverIdOrderByAssignedAtDesc(Long driverId);

    // Find all assignments for a vehicle (active and inactive)
    List<Assignment> findByVehicleIdOrderByAssignedAtDesc(Long vehicleId);

    // Find all active assignments
    @Query("SELECT a FROM Assignment a WHERE a.status = 'ACTIVE' ORDER BY a.assignedAt DESC")
    List<Assignment> findAllActiveAssignments();

    // Find all assignments with pagination
    @Query("SELECT a FROM Assignment a ORDER BY a.assignedAt DESC")
    List<Assignment> findAllOrderByAssignedAtDesc();

    // Check if driver has active assignment
    @Query("SELECT COUNT(a) > 0 FROM Assignment a WHERE a.driverId = :driverId AND a.status = 'ACTIVE'")
    boolean existsActiveAssignmentByDriverId(@Param("driverId") Long driverId);

    // Check if vehicle has active assignment
    @Query("SELECT COUNT(a) > 0 FROM Assignment a WHERE a.vehicleId = :vehicleId AND a.status = 'ACTIVE'")
    boolean existsActiveAssignmentByVehicleId(@Param("vehicleId") Long vehicleId);

    // Find assignments by status
    List<Assignment> findByStatusOrderByAssignedAtDesc(Assignment.AssignmentStatus status);

    // Find assignments assigned by specific user
    List<Assignment> findByAssignedByOrderByAssignedAtDesc(Long assignedBy);

    // Find assignments unassigned by specific user
    List<Assignment> findByUnassignedByOrderByAssignedAtDesc(Long unassignedBy);
}
