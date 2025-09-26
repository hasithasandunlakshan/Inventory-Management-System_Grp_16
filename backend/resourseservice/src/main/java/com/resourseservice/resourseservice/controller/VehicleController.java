package com.resourseservice.resourseservice.controller;

import com.resourseservice.resourseservice.dto.ApiResponse;
import com.resourseservice.resourseservice.dto.VehicleRegistrationRequest;
import com.resourseservice.resourseservice.dto.VehicleResponse;
import com.resourseservice.resourseservice.entity.Vehicle;
import com.resourseservice.resourseservice.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources/vehicles")
@RequiredArgsConstructor
@Slf4j
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<VehicleResponse>> registerVehicle(
            @Valid @RequestBody VehicleRegistrationRequest request) {
        try {
            log.info("Vehicle registration request received for vehicle number: {}", request.getVehicleNumber());

            Vehicle savedVehicle = vehicleService.registerVehicle(request);
            VehicleResponse response = VehicleResponse.fromEntity(savedVehicle);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Vehicle registered successfully with number: " + savedVehicle.getVehicleNumber()));

        } catch (RuntimeException e) {
            log.error("Vehicle registration failed: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Vehicle registration failed", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during vehicle registration: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Vehicle registration failed", "An unexpected error occurred"));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            List<VehicleResponse> responses = vehicles.stream()
                    .map(VehicleResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " vehicles"));

        } catch (Exception e) {
            log.error("Failed to get all vehicles: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicles", e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAvailableVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAvailableVehicles();
            List<VehicleResponse> responses = vehicles.stream()
                    .map(VehicleResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " available vehicles"));

        } catch (Exception e) {
            log.error("Failed to get available vehicles: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve available vehicles", e.getMessage()));
        }
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long vehicleId) {
        try {
            return vehicleService.getVehicleById(vehicleId)
                    .map(vehicle -> ResponseEntity.ok(ApiResponse.success(
                            VehicleResponse.fromEntity(vehicle), "Vehicle found")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("Vehicle not found", "No vehicle found with ID: " + vehicleId)));

        } catch (Exception e) {
            log.error("Failed to get vehicle by ID {}: {}", vehicleId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicle", e.getMessage()));
        }
    }

    @GetMapping("/by-number/{vehicleNumber}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleByNumber(@PathVariable String vehicleNumber) {
        try {
            return vehicleService.getVehicleByNumber(vehicleNumber)
                    .map(vehicle -> ResponseEntity.ok(ApiResponse.success(
                            VehicleResponse.fromEntity(vehicle), "Vehicle found")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("Vehicle not found",
                                    "No vehicle found with number: " + vehicleNumber)));

        } catch (Exception e) {
            log.error("Failed to get vehicle by number {}: {}", vehicleNumber, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicle", e.getMessage()));
        }
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByStatus(@PathVariable String status) {
        try {
            Vehicle.VehicleStatus vehicleStatus;
            try {
                vehicleStatus = Vehicle.VehicleStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Invalid status",
                                "Status must be one of: AVAILABLE, ASSIGNED, MAINTENANCE, OUT_OF_SERVICE"));
            }

            List<Vehicle> vehicles = vehicleService.getVehiclesByStatus(vehicleStatus);
            List<VehicleResponse> responses = vehicles.stream()
                    .map(VehicleResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " vehicles with status: " + status));

        } catch (Exception e) {
            log.error("Failed to get vehicles by status {}: {}", status, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicles by status", e.getMessage()));
        }
    }

    @GetMapping("/by-type/{vehicleType}")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByType(@PathVariable String vehicleType) {
        try {
            Vehicle.VehicleType type;
            try {
                type = Vehicle.VehicleType.valueOf(vehicleType.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Invalid vehicle type",
                                "Type must be one of: TRUCK, VAN, MOTORCYCLE, CAR"));
            }

            List<Vehicle> vehicles = vehicleService.getVehiclesByType(type);
            List<VehicleResponse> responses = vehicles.stream()
                    .map(VehicleResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses,
                    "Successfully retrieved " + responses.size() + " vehicles of type: " + vehicleType));

        } catch (Exception e) {
            log.error("Failed to get vehicles by type {}: {}", vehicleType, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicles by type", e.getMessage()));
        }
    }

    @GetMapping("/by-driver/{driverId}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleByDriver(@PathVariable Long driverId) {
        try {
            return vehicleService.getVehicleByDriverId(driverId)
                    .map(vehicle -> ResponseEntity.ok(ApiResponse.success(
                            VehicleResponse.fromEntity(vehicle), "Vehicle assigned to driver found")))
                    .orElse(ResponseEntity.status(404)
                            .body(ApiResponse.error("No vehicle assigned",
                                    "No vehicle assigned to driver ID: " + driverId)));

        } catch (Exception e) {
            log.error("Failed to get vehicle by driver ID {}: {}", driverId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve vehicle by driver", e.getMessage()));
        }
    }
}
