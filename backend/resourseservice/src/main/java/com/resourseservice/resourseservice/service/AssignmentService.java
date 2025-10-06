package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.dto.AssignmentRequest;
import com.resourseservice.resourseservice.dto.DetailedAssignmentResponse;
import com.resourseservice.resourseservice.dto.MinimalAssignmentResponse;
import com.resourseservice.resourseservice.entity.Assignment;
import com.resourseservice.resourseservice.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // New optimized methods using JOINs
    public List<MinimalAssignmentResponse> getAllAssignmentsMinimal() {
        log.info("Fetching all assignments with minimal details using optimized query");
        List<Object[]> results = assignmentRepository.findAllAssignmentsWithMinimalDetails();
        return results.stream()
                .map(this::convertObjectArrayToMinimalResponse)
                .collect(Collectors.toList());
    }

    public List<MinimalAssignmentResponse> getActiveAssignmentsMinimal() {
        log.info("Fetching active assignments with minimal details using optimized query");
        List<Object[]> results = assignmentRepository.findActiveAssignmentsWithMinimalDetails();
        return results.stream()
                .map(this::convertObjectArrayToMinimalResponse)
                .collect(Collectors.toList());
    }

    public Optional<DetailedAssignmentResponse> getAssignmentDetailsById(Long assignmentId) {
        log.info("Fetching detailed assignment by ID: {} using basic query", assignmentId);
        Optional<Assignment> assignment = assignmentRepository.findById(assignmentId);
        if (assignment.isPresent()) {
            Assignment a = assignment.get();
            DetailedAssignmentResponse response = DetailedAssignmentResponse.builder()
                    .assignmentId(a.getAssignmentId())
                    .driverId(a.getDriverId())
                    .vehicleId(a.getVehicleId())
                    .status(a.getStatus())
                    .assignedBy(a.getAssignedBy())
                    .assignedAt(a.getAssignedAt())
                    .unassignedAt(a.getUnassignedAt())
                    .unassignedBy(a.getUnassignedBy())
                    .notes(a.getNotes())
                    .createdAt(a.getCreatedAt())
                    .updatedAt(a.getUpdatedAt())
                    .driverDetails(null)
                    .assignedByDetails(null)
                    .unassignedByDetails(null)
                    .vehicleDetails(null)
                    .build();
            return Optional.of(response);
        }
        return Optional.empty();
    }

    private MinimalAssignmentResponse convertObjectArrayToMinimalResponse(Object[] result) {
        return MinimalAssignmentResponse.builder()
                .assignmentId(((Number) result[0]).longValue())
                .driverId(((Number) result[1]).longValue())
                .vehicleId(((Number) result[2]).longValue())
                .status(Assignment.AssignmentStatus.valueOf((String) result[3]))
                .assignedAt(((java.sql.Timestamp) result[4]).toLocalDateTime())
                .unassignedAt(result[5] != null ? ((java.sql.Timestamp) result[5]).toLocalDateTime() : null)
                .notes((String) result[6])
                .driverName(result[7] != null ? (String) result[7] : "Driver " + result[1])
                .vehicleNumber(result[8] != null ? (String) result[8] : "Vehicle " + result[2])
                .assignedByName(result[9] != null ? (String) result[9] : null)
                .build();
    }

    private DetailedAssignmentResponse convertObjectArrayToDetailedResponse(Object[] result) {
        // Extract assignment basic info
        Long assignmentId = ((Number) result[0]).longValue();
        Long driverId = ((Number) result[1]).longValue();
        Long vehicleId = ((Number) result[2]).longValue();
        Assignment.AssignmentStatus status = Assignment.AssignmentStatus.valueOf((String) result[3]);
        Long assignedBy = result[4] != null ? ((Number) result[4]).longValue() : null;
        java.time.LocalDateTime assignedAt = ((java.sql.Timestamp) result[5]).toLocalDateTime();
        java.time.LocalDateTime unassignedAt = result[6] != null ? ((java.sql.Timestamp) result[6]).toLocalDateTime()
                : null;
        Long unassignedBy = result[7] != null ? ((Number) result[7]).longValue() : null;
        String notes = (String) result[8];
        java.time.LocalDateTime createdAt = ((java.sql.Timestamp) result[9]).toLocalDateTime();
        java.time.LocalDateTime updatedAt = ((java.sql.Timestamp) result[10]).toLocalDateTime();

        // For now, return basic assignment details without the complex joins
        // TODO: Add separate queries to get driver, user, and vehicle details
        return DetailedAssignmentResponse.builder()
                .assignmentId(assignmentId)
                .driverId(driverId)
                .vehicleId(vehicleId)
                .status(status)
                .assignedBy(assignedBy)
                .assignedAt(assignedAt)
                .unassignedAt(unassignedAt)
                .unassignedBy(unassignedBy)
                .notes(notes)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .driverDetails(null) // TODO: Add separate query
                .assignedByDetails(null) // TODO: Add separate query
                .unassignedByDetails(null) // TODO: Add separate query
                .vehicleDetails(null) // TODO: Add separate query
                .build();
    }
}
