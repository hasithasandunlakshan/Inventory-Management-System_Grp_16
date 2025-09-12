package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.dto.AssignmentRequest;
import com.resourseservice.resourseservice.entity.Assignment;
import com.resourseservice.resourseservice.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public List<Assignment> getAllAssignments() {
        log.info("Fetching all assignments");
        return assignmentRepository.findAllOrderByAssignedAtDesc();
    }

    public List<Assignment> getActiveAssignments() {
        log.info("Fetching active assignments");
        return assignmentRepository.findAllActiveAssignments();
    }

    public Optional<Assignment> getAssignmentById(Long assignmentId) {
        log.info("Fetching assignment by ID: {}", assignmentId);
        return assignmentRepository.findById(assignmentId);
    }

    public Optional<Assignment> getActiveAssignmentByDriverId(Long driverId) {
        log.info("Fetching active assignment for driver ID: {}", driverId);
        return assignmentRepository.findActiveAssignmentByDriverId(driverId);
    }

    public Optional<Assignment> getActiveAssignmentByVehicleId(Long vehicleId) {
        log.info("Fetching active assignment for vehicle ID: {}", vehicleId);
        return assignmentRepository.findActiveAssignmentByVehicleId(vehicleId);
    }

    public List<Assignment> getAssignmentsByDriverId(Long driverId) {
        log.info("Fetching all assignments for driver ID: {}", driverId);
        return assignmentRepository.findByDriverIdOrderByAssignedAtDesc(driverId);
    }

    public List<Assignment> getAssignmentsByVehicleId(Long vehicleId) {
        log.info("Fetching all assignments for vehicle ID: {}", vehicleId);
        return assignmentRepository.findByVehicleIdOrderByAssignedAtDesc(vehicleId);
    }

    public List<Assignment> getAssignmentsByStatus(Assignment.AssignmentStatus status) {
        log.info("Fetching assignments by status: {}", status);
        return assignmentRepository.findByStatusOrderByAssignedAtDesc(status);
    }

    @Transactional
    public Assignment assignDriverToVehicle(AssignmentRequest request) {
        log.info("Assigning driver ID {} to vehicle ID {}", request.getDriverId(), request.getVehicleId());

        // Check if driver already has an active assignment
        if (assignmentRepository.existsActiveAssignmentByDriverId(request.getDriverId())) {
            throw new RuntimeException("Driver already has an active assignment");
        }

        // Check if vehicle already has an active assignment
        if (assignmentRepository.existsActiveAssignmentByVehicleId(request.getVehicleId())) {
            throw new RuntimeException("Vehicle already has an active assignment");
        }

        // Create new assignment
        Assignment assignment = new Assignment();
        assignment.setDriverId(request.getDriverId());
        assignment.setVehicleId(request.getVehicleId());
        assignment.setAssignedBy(request.getAssignedBy());
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setNotes(request.getNotes());
        assignment.setStatus(Assignment.AssignmentStatus.ACTIVE);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("Successfully assigned driver ID {} to vehicle ID {} with assignment ID {}",
                request.getDriverId(), request.getVehicleId(), savedAssignment.getAssignmentId());

        return savedAssignment;
    }

    @Transactional
    public Assignment unassignDriverFromVehicle(Long assignmentId, Long unassignedBy, String notes) {
        log.info("Unassigning assignment ID {} by user ID {}", assignmentId, unassignedBy);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.isActive()) {
            throw new RuntimeException("Assignment is already inactive");
        }

        assignment.deactivate(unassignedBy, notes);
        Assignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Successfully unassigned driver ID {} from vehicle ID {}",
                assignment.getDriverId(), assignment.getVehicleId());

        return savedAssignment;
    }

    @Transactional
    public Assignment unassignDriverFromVehicleByDriverId(Long driverId, Long unassignedBy, String notes) {
        log.info("Unassigning driver ID {} by user ID {}", driverId, unassignedBy);

        Assignment assignment = assignmentRepository.findActiveAssignmentByDriverId(driverId)
                .orElseThrow(() -> new RuntimeException("No active assignment found for driver ID: " + driverId));

        assignment.deactivate(unassignedBy, notes);
        Assignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Successfully unassigned driver ID {} from vehicle ID {}",
                assignment.getDriverId(), assignment.getVehicleId());

        return savedAssignment;
    }

    @Transactional
    public Assignment unassignDriverFromVehicleByVehicleId(Long vehicleId, Long unassignedBy, String notes) {
        log.info("Unassigning vehicle ID {} by user ID {}", vehicleId, unassignedBy);

        Assignment assignment = assignmentRepository.findActiveAssignmentByVehicleId(vehicleId)
                .orElseThrow(() -> new RuntimeException("No active assignment found for vehicle ID: " + vehicleId));

        assignment.deactivate(unassignedBy, notes);
        Assignment savedAssignment = assignmentRepository.save(assignment);

        log.info("Successfully unassigned driver ID {} from vehicle ID {}",
                assignment.getDriverId(), assignment.getVehicleId());

        return savedAssignment;
    }
}
