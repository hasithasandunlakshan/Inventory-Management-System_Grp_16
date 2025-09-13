package com.resourseservice.resourseservice.controller;

import com.resourseservice.resourseservice.dto.ApiResponse;
import com.resourseservice.resourseservice.dto.DriverRegistrationRequest;
import com.resourseservice.resourseservice.dto.DriverProfileResponse;
import com.resourseservice.resourseservice.entity.DriverProfile;
import com.resourseservice.resourseservice.service.DriverProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources/drivers")
@RequiredArgsConstructor
@Slf4j
public class DriverController {

    private final DriverProfileService driverProfileService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> registerDriver(
            @Valid @RequestBody DriverRegistrationRequest request) {
        
        try {
            DriverProfile driverProfile = driverProfileService.registerDriver(request);
            DriverProfileResponse response = DriverProfileResponse.fromEntity(driverProfile);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Driver registered successfully"));
                    
        } catch (Exception e) {
            log.error("Driver registration failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Driver registration failed", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverProfileResponse>>> getAllDrivers() {
        try {
            List<DriverProfile> driverProfiles = driverProfileService.getAllDriverProfiles();
            List<DriverProfileResponse> responses = driverProfiles.stream()
                    .map(DriverProfileResponse::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(responses, 
                    "Successfully retrieved " + responses.size() + " drivers"));
                    
        } catch (Exception e) {
            log.error("Failed to get all drivers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve drivers", e.getMessage()));
        }
    }

    @GetMapping("/{driverId}")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> getDriverById(@PathVariable Long driverId) {
        try {
            Optional<DriverProfile> driverProfile = driverProfileService.getDriverProfileById(driverId);
            
            if (driverProfile.isPresent()) {
                DriverProfileResponse response = DriverProfileResponse.fromEntity(driverProfile.get());
                return ResponseEntity.ok(ApiResponse.success(response, "Driver found successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Driver not found with ID: " + driverId));
            }
            
        } catch (Exception e) {
            log.error("Failed to get driver by ID: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve driver", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> getDriverByUserId(@PathVariable Long userId) {
        try {
            Optional<DriverProfile> driverProfile = driverProfileService.getDriverProfileByUserId(userId);
            
            if (driverProfile.isPresent()) {
                DriverProfileResponse response = DriverProfileResponse.fromEntity(driverProfile.get());
                return ResponseEntity.ok(ApiResponse.success(response, "Driver found successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Driver not found for user ID: " + userId));
            }
            
        } catch (Exception e) {
            log.error("Failed to get driver by user ID: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve driver", e.getMessage()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DriverProfileResponse>>> getAvailableDrivers() {
        try {
            List<DriverProfile> availableDrivers = driverProfileService.getAvailableDrivers();
            List<DriverProfileResponse> responses = availableDrivers.stream()
                    .map(DriverProfileResponse::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(responses, 
                    "Successfully retrieved " + responses.size() + " available drivers"));
                    
        } catch (Exception e) {
            log.error("Failed to get available drivers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve available drivers", e.getMessage()));
        }
    }
}
