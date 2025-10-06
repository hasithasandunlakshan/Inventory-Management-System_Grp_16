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

    // Optimized query to get all assignments with minimal details using native SQL
    @Query(value = "SELECT a.assignment_id, a.driver_id, a.vehicle_id, a.status, a.assigned_at, a.unassigned_at, a.notes, "
            +
            "u_driver.full_name as driverName, v.vehicle_number as vehicleNumber, u_assigned.full_name as assignedByName "
            +
            "FROM assignments a " +
            "LEFT JOIN driver_profiles dp ON a.driver_id = dp.driver_id " +
            "LEFT JOIN users u_driver ON dp.user_id = u_driver.user_id " +
            "LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id " +
            "LEFT JOIN users u_assigned ON a.assigned_by = u_assigned.user_id " +
            "ORDER BY a.assigned_at DESC", nativeQuery = true)
    List<Object[]> findAllAssignmentsWithMinimalDetails();

    // Optimized query to get active assignments with minimal details using native
    // SQL
    @Query(value = "SELECT a.assignment_id, a.driver_id, a.vehicle_id, a.status, a.assigned_at, a.unassigned_at, a.notes, "
            +
            "u_driver.full_name as driverName, v.vehicle_number as vehicleNumber, u_assigned.full_name as assignedByName "
            +
            "FROM assignments a " +
            "LEFT JOIN driver_profiles dp ON a.driver_id = dp.driver_id " +
            "LEFT JOIN users u_driver ON dp.user_id = u_driver.user_id " +
            "LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id " +
            "LEFT JOIN users u_assigned ON a.assigned_by = u_assigned.user_id " +
            "WHERE a.status = 'ACTIVE' " +
            "ORDER BY a.assigned_at DESC", nativeQuery = true)
    List<Object[]> findActiveAssignmentsWithMinimalDetails();

    // Simplified query to get detailed assignment by ID using native SQL
    @Query(value = "SELECT a.assignment_id, a.driver_id, a.vehicle_id, a.status, a.assigned_by, a.assigned_at, " +
            "a.unassigned_at, a.unassigned_by, a.notes, a.created_at, a.updated_at " +
            "FROM assignments a " +
            "WHERE a.assignment_id = :assignmentId", nativeQuery = true)
    Object[] findAssignmentDetailsById(@Param("assignmentId") Long assignmentId);
}
