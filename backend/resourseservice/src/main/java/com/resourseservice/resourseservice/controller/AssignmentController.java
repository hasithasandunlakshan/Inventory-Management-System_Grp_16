package com.resourseservice.resourseservice.controller;

import com.resourseservice.resourseservice.dto.ApiResponse;
import com.resourseservice.resourseservice.dto.AssignmentRequest;
import com.resourseservice.resourseservice.dto.AssignmentResponse;
import com.resourseservice.resourseservice.entity.Assignment;
import com.resourseservice.resourseservice.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources/assignments")
@RequiredArgsConstructor
@Slf4j
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments() {
        try {
            List<Assignment> assignments = assignmentService.getAllAssignments();
            List<AssignmentResponse> responses = assignments.stream()
                    .map(AssignmentResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " assignments"));

        } catch (Exception e) {
            log.error("Failed to get all assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve assignments", e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getActiveAssignments() {
        try {
            List<Assignment> assignments = assignmentService.getActiveAssignments();
            List<AssignmentResponse> responses = assignments.stream()
                    .map(AssignmentResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " active assignments"));

        } catch (Exception e) {
            log.error("Failed to get active assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve active assignments", e.getMessage()));
        }
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Long assignmentId) {
        try {
            return assignmentService.getAssignmentById(assignmentId)
                    .map(assignment -> ResponseEntity.ok(ApiResponse.success(
                            AssignmentResponse.fromEntity(assignment), "Assignment found")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("Assignment not found",
                                    "No assignment found with ID: " + assignmentId)));

        } catch (Exception e) {
            log.error("Failed to get assignment by ID {}: {}", assignmentId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve assignment", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByDriverId(@PathVariable Long driverId) {
        try {
            List<Assignment> assignments = assignmentService.getAssignmentsByDriverId(driverId);
            List<AssignmentResponse> responses = assignments.stream()
                    .map(AssignmentResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " assignments for driver ID: " + driverId));

        } catch (Exception e) {
            log.error("Failed to get assignments by driver ID {}: {}", driverId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve assignments by driver", e.getMessage()));
        }
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByVehicleId(
            @PathVariable Long vehicleId) {
        try {
            List<Assignment> assignments = assignmentService.getAssignmentsByVehicleId(vehicleId);
            List<AssignmentResponse> responses = assignments.stream()
                    .map(AssignmentResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " assignments for vehicle ID: " + vehicleId));

        } catch (Exception e) {
            log.error("Failed to get assignments by vehicle ID {}: {}", vehicleId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve assignments by vehicle", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/active")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getActiveAssignmentByDriverId(@PathVariable Long driverId) {
        try {
            return assignmentService.getActiveAssignmentByDriverId(driverId)
                    .map(assignment -> ResponseEntity.ok(ApiResponse.success(
                            AssignmentResponse.fromEntity(assignment), "Active assignment found for driver")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("No active assignment",
                                    "No active assignment found for driver ID: " + driverId)));

        } catch (Exception e) {
            log.error("Failed to get active assignment by driver ID {}: {}", driverId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve active assignment", e.getMessage()));
        }
    }

    @GetMapping("/vehicle/{vehicleId}/active")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getActiveAssignmentByVehicleId(
            @PathVariable Long vehicleId) {
        try {
            return assignmentService.getActiveAssignmentByVehicleId(vehicleId)
                    .map(assignment -> ResponseEntity.ok(ApiResponse.success(
                            AssignmentResponse.fromEntity(assignment), "Active assignment found for vehicle")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("No active assignment",
                                    "No active assignment found for vehicle ID: " + vehicleId)));

        } catch (Exception e) {
            log.error("Failed to get active assignment by vehicle ID {}: {}", vehicleId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve active assignment", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignDriverToVehicle(
            @Valid @RequestBody AssignmentRequest request) {
        try {
            log.info("Assignment request received for driver ID: {} to vehicle ID: {}",
                    request.getDriverId(), request.getVehicleId());

            Assignment savedAssignment = assignmentService.assignDriverToVehicle(request);
            AssignmentResponse response = AssignmentResponse.fromEntity(savedAssignment);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Driver successfully assigned to vehicle"));

        } catch (RuntimeException e) {
            log.error("Assignment failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Assignment failed", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during assignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Assignment failed", "An unexpected error occurred"));
        }
    }

    @PutMapping("/{assignmentId}/unassign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> unassignDriverFromVehicle(
            @PathVariable Long assignmentId,
            @RequestParam Long unassignedBy,
            @RequestParam(required = false) String notes) {
        try {
            log.info("Unassignment request received for assignment ID: {} by user ID: {}",
                    assignmentId, unassignedBy);

            Assignment unassignedAssignment = assignmentService.unassignDriverFromVehicle(assignmentId, unassignedBy,
                    notes);
            AssignmentResponse response = AssignmentResponse.fromEntity(unassignedAssignment);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Driver successfully unassigned from vehicle"));

        } catch (RuntimeException e) {
            log.error("Unassignment failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Unassignment failed", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during unassignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Unassignment failed", "An unexpected error occurred"));
        }
    }

    @PutMapping("/driver/{driverId}/unassign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> unassignDriverFromVehicleByDriverId(
            @PathVariable Long driverId,
            @RequestParam Long unassignedBy,
            @RequestParam(required = false) String notes) {
        try {
            log.info("Unassignment request received for driver ID: {} by user ID: {}",
                    driverId, unassignedBy);

            Assignment unassignedAssignment = assignmentService.unassignDriverFromVehicleByDriverId(driverId,
                    unassignedBy, notes);
            AssignmentResponse response = AssignmentResponse.fromEntity(unassignedAssignment);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Driver successfully unassigned from vehicle"));

        } catch (RuntimeException e) {
            log.error("Unassignment failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Unassignment failed", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during unassignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Unassignment failed", "An unexpected error occurred"));
        }
    }

    @PutMapping("/vehicle/{vehicleId}/unassign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> unassignDriverFromVehicleByVehicleId(
            @PathVariable Long vehicleId,
            @RequestParam Long unassignedBy,
            @RequestParam(required = false) String notes) {
        try {
            log.info("Unassignment request received for vehicle ID: {} by user ID: {}",
                    vehicleId, unassignedBy);

            Assignment unassignedAssignment = assignmentService.unassignDriverFromVehicleByVehicleId(vehicleId,
                    unassignedBy, notes);
            AssignmentResponse response = AssignmentResponse.fromEntity(unassignedAssignment);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Driver successfully unassigned from vehicle"));

        } catch (RuntimeException e) {
            log.error("Unassignment failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Unassignment failed", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during unassignment: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Unassignment failed", "An unexpected error occurred"));
        }
    }
}
