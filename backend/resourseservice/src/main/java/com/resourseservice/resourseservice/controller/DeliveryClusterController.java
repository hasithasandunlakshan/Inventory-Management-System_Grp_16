package com.resourseservice.resourseservice.controller;

import com.resourseservice.resourseservice.dto.ApiResponse;
import com.resourseservice.resourseservice.dto.AssignDriverToClusterRequest;
import com.resourseservice.resourseservice.dto.CreateClusterRequest;
import com.resourseservice.resourseservice.dto.DeliveryClusterResponse;
import com.resourseservice.resourseservice.entity.ClusterOrder;
import com.resourseservice.resourseservice.entity.DeliveryCluster;
import com.resourseservice.resourseservice.service.DeliveryClusterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources/delivery-clusters")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DeliveryClusterController {

    private final DeliveryClusterService deliveryClusterService;

    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryClusterResponse>> createCluster(
            @RequestBody CreateClusterRequest request) {
        try {
            log.info("Creating delivery cluster: {}", request.getClusterName());

            DeliveryClusterResponse response = deliveryClusterService.createCluster(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Cluster created successfully"));

        } catch (Exception e) {
            log.error("Failed to create cluster: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create cluster", e.getMessage()));
        }
    }

    @PostMapping("/assign-driver")
    public ResponseEntity<ApiResponse<DeliveryClusterResponse>> assignDriverToCluster(
            @RequestBody AssignDriverToClusterRequest request) {
        try {
            log.info("Assigning driver to cluster ID: {}", request.getClusterId());

            DeliveryClusterResponse response = deliveryClusterService.assignDriverToCluster(request);

            return ResponseEntity.ok(ApiResponse.success(response, "Driver assigned successfully"));

        } catch (Exception e) {
            log.error("Failed to assign driver to cluster: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to assign driver", e.getMessage()));
        }
    }

    @GetMapping("/{clusterId}")
    public ResponseEntity<ApiResponse<DeliveryClusterResponse>> getClusterById(
            @PathVariable Long clusterId) {
        try {
            log.info("Fetching cluster with ID: {}", clusterId);

            DeliveryClusterResponse response = deliveryClusterService.getClusterById(clusterId);

            return ResponseEntity.ok(ApiResponse.success(response, "Cluster retrieved successfully"));

        } catch (Exception e) {
            log.error("Failed to fetch cluster: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Cluster not found", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryClusterResponse>>> getAllClusters() {
        try {
            log.info("Fetching all delivery clusters");

            List<DeliveryClusterResponse> response = deliveryClusterService.getAllClusters();

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Retrieved " + response.size() + " clusters"));

        } catch (Exception e) {
            log.error("Failed to fetch clusters: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch clusters", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<DeliveryClusterResponse>>> getPendingClusters() {
        try {
            log.info("Fetching pending delivery clusters");

            List<DeliveryClusterResponse> response = deliveryClusterService.getPendingClusters();

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Retrieved " + response.size() + " pending clusters"));

        } catch (Exception e) {
            log.error("Failed to fetch pending clusters: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch pending clusters", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<List<DeliveryClusterResponse>>> getDriverClusters(
            @PathVariable Long driverId) {
        try {
            log.info("Fetching clusters for driver ID: {}", driverId);

            List<DeliveryClusterResponse> response = deliveryClusterService.getDriverClusters(driverId);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Retrieved " + response.size() + " clusters for driver"));

        } catch (Exception e) {
            log.error("Failed to fetch driver clusters: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch driver clusters", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/status/{status}")
    public ResponseEntity<ApiResponse<List<DeliveryClusterResponse>>> getDriverClustersByStatus(
            @PathVariable Long driverId,
            @PathVariable String status) {
        try {
            log.info("Fetching clusters for driver ID: {} with status: {}", driverId, status);

            // Convert string to ClusterStatus enum
            DeliveryCluster.ClusterStatus clusterStatus = DeliveryCluster.ClusterStatus.valueOf(status.toUpperCase());

            List<DeliveryClusterResponse> response = deliveryClusterService.getClustersByDriverIdAndStatus(driverId,
                    clusterStatus);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Retrieved " + response.size() + " " + status + " clusters for driver"));

        } catch (IllegalArgumentException e) {
            log.error("Invalid cluster status: {}", status);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid cluster status",
                            "Valid statuses are: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED"));
        } catch (Exception e) {
            log.error("Failed to fetch driver clusters by status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch driver clusters", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/delivery-sequence")
    public ResponseEntity<ApiResponse<List<DeliveryClusterResponse.ClusterOrderResponse>>> getDriverDeliverySequence(
            @PathVariable Long driverId) {
        try {
            log.info("Fetching TSP-optimized delivery sequence for driver ID: {}", driverId);

            List<DeliveryClusterResponse.ClusterOrderResponse> response = deliveryClusterService
                    .getDriverDeliverySequence(driverId);

            return ResponseEntity.ok(ApiResponse.success(response,
                    "Retrieved delivery sequence with " + response.size() + " orders"));

        } catch (Exception e) {
            log.error("Failed to fetch delivery sequence: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch delivery sequence", e.getMessage()));
        }
    }

    @PatchMapping("/{clusterId}/status")
    public ResponseEntity<ApiResponse<DeliveryClusterResponse>> updateClusterStatus(
            @PathVariable Long clusterId,
            @RequestParam DeliveryCluster.ClusterStatus status) {
        try {
            log.info("Updating cluster {} status to {}", clusterId, status);

            DeliveryClusterResponse response = deliveryClusterService.updateClusterStatus(clusterId, status);

            return ResponseEntity.ok(ApiResponse.success(response, "Cluster status updated successfully"));

        } catch (Exception e) {
            log.error("Failed to update cluster status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update cluster status", e.getMessage()));
        }
    }

    @PatchMapping("/orders/{clusterOrderId}/delivery-status")
    public ResponseEntity<ApiResponse<String>> updateOrderDeliveryStatus(
            @PathVariable Long clusterOrderId,
            @RequestParam ClusterOrder.DeliveryStatus status,
            @RequestParam(required = false) String notes) {
        try {
            log.info("Updating cluster order {} delivery status to {}", clusterOrderId, status);

            deliveryClusterService.updateOrderDeliveryStatus(clusterOrderId, status, notes);

            return ResponseEntity.ok(ApiResponse.success("Success", "Order delivery status updated successfully"));

        } catch (Exception e) {
            log.error("Failed to update order delivery status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update order delivery status", e.getMessage()));
        }
    }
}
