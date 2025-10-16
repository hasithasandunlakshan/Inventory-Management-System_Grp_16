package com.resourseservice.resourseservice.service;

import com.resourseservice.resourseservice.dto.AssignDriverToClusterRequest;
import com.resourseservice.resourseservice.dto.CreateClusterRequest;
import com.resourseservice.resourseservice.dto.DeliveryClusterResponse;
import com.resourseservice.resourseservice.entity.Assignment;
import com.resourseservice.resourseservice.entity.ClusterOrder;
import com.resourseservice.resourseservice.entity.DeliveryCluster;
import com.resourseservice.resourseservice.entity.DriverProfile;
import com.resourseservice.resourseservice.repository.AssignmentRepository;
import com.resourseservice.resourseservice.repository.ClusterOrderRepository;
import com.resourseservice.resourseservice.repository.DeliveryClusterRepository;
import com.resourseservice.resourseservice.repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DeliveryClusterService {

    private final DeliveryClusterRepository deliveryClusterRepository;
    private final ClusterOrderRepository clusterOrderRepository;
    private final AssignmentRepository assignmentRepository;
    private final DriverProfileRepository driverProfileRepository;

    public DeliveryClusterResponse createCluster(CreateClusterRequest request) {
        log.info("Creating delivery cluster: {}", request.getClusterName());

        // Check if cluster name already exists
        if (deliveryClusterRepository.existsByClusterName(request.getClusterName())) {
            throw new RuntimeException("Cluster with name " + request.getClusterName() + " already exists");
        }

        // Create delivery cluster
        DeliveryCluster cluster = DeliveryCluster.builder()
                .clusterName(request.getClusterName())
                .totalDistance(request.getTotalDistance())
                .estimatedTime(request.getEstimatedTime())
                .status(DeliveryCluster.ClusterStatus.PENDING)
                .createdBy(request.getCreatedBy())
                .build();

        // Add cluster orders with TSP-optimized sequence
        if (request.getOrders() != null && !request.getOrders().isEmpty()) {
            for (CreateClusterRequest.ClusterOrderRequest orderReq : request.getOrders()) {
                ClusterOrder clusterOrder = ClusterOrder.builder()
                        .orderId(orderReq.getOrderId())
                        .deliverySequence(orderReq.getDeliverySequence())
                        .customerLatitude(orderReq.getCustomerLatitude())
                        .customerLongitude(orderReq.getCustomerLongitude())
                        .customerAddress(orderReq.getCustomerAddress())
                        .deliveryStatus(ClusterOrder.DeliveryStatus.PENDING)
                        .build();

                cluster.addClusterOrder(clusterOrder);
            }
        }

        DeliveryCluster savedCluster = deliveryClusterRepository.save(cluster);
        log.info("Successfully created cluster with ID: {} containing {} orders",
                savedCluster.getClusterId(), savedCluster.getClusterOrders().size());

        return mapToResponse(savedCluster);
    }

    public DeliveryClusterResponse assignDriverToCluster(AssignDriverToClusterRequest request) {
        log.info("Assigning driver to cluster ID: {}", request.getClusterId());

        // Find cluster
        DeliveryCluster cluster = deliveryClusterRepository.findByIdWithOrders(request.getClusterId())
                .orElseThrow(() -> new RuntimeException("Cluster not found with ID: " + request.getClusterId()));

        // Verify cluster is in PENDING status
        if (cluster.getStatus() != DeliveryCluster.ClusterStatus.PENDING) {
            throw new RuntimeException("Cluster is not in PENDING status. Current status: " + cluster.getStatus());
        }

        // Find assignment and verify it's active
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + request.getAssignmentId()));

        if (assignment.getStatus() != Assignment.AssignmentStatus.ACTIVE) {
            throw new RuntimeException("Assignment is not active. Current status: " + assignment.getStatus());
        }

        // Get driver profile and verify availability
        DriverProfile driverProfile = driverProfileRepository.findById(assignment.getDriverId())
                .orElseThrow(
                        () -> new RuntimeException("Driver profile not found with ID: " + assignment.getDriverId()));

        if (driverProfile.getAvailabilityStatus() != DriverProfile.AvailabilityStatus.AVAILABLE) {
            throw new RuntimeException(
                    "Driver is not available. Current status: " + driverProfile.getAvailabilityStatus());
        }

        // Assign driver to cluster
        cluster.setAssignedDriverId(driverProfile.getDriverId());
        cluster.setAssignmentId(assignment.getAssignmentId());
        cluster.setStatus(DeliveryCluster.ClusterStatus.ASSIGNED);
        cluster.setAssignedAt(LocalDateTime.now());

        // Update driver status to BUSY
        driverProfile.setAvailabilityStatus(DriverProfile.AvailabilityStatus.BUSY);
        driverProfileRepository.save(driverProfile);

        DeliveryCluster updatedCluster = deliveryClusterRepository.save(cluster);
        log.info("Successfully assigned driver {} to cluster {}",
                driverProfile.getDriverId(), cluster.getClusterId());

        return mapToResponse(updatedCluster);
    }

    @Transactional(readOnly = true)
    public DeliveryClusterResponse getClusterById(Long clusterId) {
        log.info("Fetching cluster with ID: {}", clusterId);

        DeliveryCluster cluster = deliveryClusterRepository.findByIdWithOrders(clusterId)
                .orElseThrow(() -> new RuntimeException("Cluster not found with ID: " + clusterId));

        return mapToResponse(cluster);
    }

    @Transactional(readOnly = true)
    public List<DeliveryClusterResponse> getAllClusters() {
        log.info("Fetching all delivery clusters");

        List<DeliveryCluster> clusters = deliveryClusterRepository.findAll();
        return clusters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryClusterResponse> getPendingClusters() {
        log.info("Fetching pending delivery clusters");

        List<DeliveryCluster> clusters = deliveryClusterRepository.findPendingClusters();
        return clusters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryClusterResponse> getDriverClusters(Long driverId) {
        log.info("Fetching clusters for driver ID: {}", driverId);

        List<DeliveryCluster> clusters = deliveryClusterRepository.findActiveClustersByDriver(driverId);
        return clusters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryClusterResponse.ClusterOrderResponse> getDriverDeliverySequence(Long driverId) {
        log.info("Fetching TSP-optimized delivery sequence for driver ID: {}", driverId);

        List<ClusterOrder> orders = clusterOrderRepository.findPendingDeliveriesByDriver(driverId);

        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryClusterResponse> getClustersByDriverIdAndStatus(Long driverId, DeliveryCluster.ClusterStatus status) {
        log.info("Fetching clusters for driver ID: {} with status: {}", driverId, status);

        List<DeliveryCluster> clusters = deliveryClusterRepository.findByDriverIdAndStatus(driverId, status);
        
        log.info("Found {} clusters for driver ID: {} with status: {}", clusters.size(), driverId, status);
        
        return clusters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DeliveryClusterResponse updateClusterStatus(Long clusterId, DeliveryCluster.ClusterStatus newStatus) {
        log.info("Updating cluster {} status to {}", clusterId, newStatus);

        DeliveryCluster cluster = deliveryClusterRepository.findById(clusterId)
                .orElseThrow(() -> new RuntimeException("Cluster not found with ID: " + clusterId));

        cluster.setStatus(newStatus);

        if (newStatus == DeliveryCluster.ClusterStatus.COMPLETED) {
            cluster.setCompletedAt(LocalDateTime.now());

            // Update driver status back to AVAILABLE
            if (cluster.getAssignedDriverId() != null) {
                driverProfileRepository.findById(cluster.getAssignedDriverId())
                        .ifPresent(driver -> {
                            driver.setAvailabilityStatus(DriverProfile.AvailabilityStatus.AVAILABLE);
                            driverProfileRepository.save(driver);
                        });
            }
        }

        DeliveryCluster updatedCluster = deliveryClusterRepository.save(cluster);
        return mapToResponse(updatedCluster);
    }

    public void updateOrderDeliveryStatus(Long clusterOrderId, ClusterOrder.DeliveryStatus status, String notes) {
        log.info("Updating cluster order {} delivery status to {}", clusterOrderId, status);

        ClusterOrder clusterOrder = clusterOrderRepository.findById(clusterOrderId)
                .orElseThrow(() -> new RuntimeException("Cluster order not found with ID: " + clusterOrderId));

        clusterOrder.setDeliveryStatus(status);
        clusterOrder.setDeliveryNotes(notes);

        if (status == ClusterOrder.DeliveryStatus.DELIVERED) {
            clusterOrder.setDeliveredAt(LocalDateTime.now());
        }

        clusterOrderRepository.save(clusterOrder);
    }

    private DeliveryClusterResponse mapToResponse(DeliveryCluster cluster) {
        String driverName = null;
        if (cluster.getAssignedDriverId() != null) {
            driverName = driverProfileRepository.findById(cluster.getAssignedDriverId())
                    .map(driver -> "Driver #" + driver.getDriverId())
                    .orElse("Unknown Driver");
        }

        List<DeliveryClusterResponse.ClusterOrderResponse> orderResponses = cluster.getClusterOrders().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return DeliveryClusterResponse.builder()
                .clusterId(cluster.getClusterId())
                .clusterName(cluster.getClusterName())
                .assignedDriverId(cluster.getAssignedDriverId())
                .driverName(driverName)
                .assignmentId(cluster.getAssignmentId())
                .totalDistance(cluster.getTotalDistance())
                .estimatedTime(cluster.getEstimatedTime())
                .status(cluster.getStatus())
                .createdAt(cluster.getCreatedAt())
                .assignedAt(cluster.getAssignedAt())
                .completedAt(cluster.getCompletedAt())
                .totalOrders(cluster.getClusterOrders().size())
                .orders(orderResponses)
                .build();
    }

    private DeliveryClusterResponse.ClusterOrderResponse mapToOrderResponse(ClusterOrder order) {
        return DeliveryClusterResponse.ClusterOrderResponse.builder()
                .clusterOrderId(order.getClusterOrderId())
                .orderId(order.getOrderId())
                .deliverySequence(order.getDeliverySequence())
                .customerLatitude(order.getCustomerLatitude())
                .customerLongitude(order.getCustomerLongitude())
                .customerAddress(order.getCustomerAddress())
                .deliveryStatus(order.getDeliveryStatus().name())
                .deliveredAt(order.getDeliveredAt())
                .deliveryNotes(order.getDeliveryNotes())
                .build();
    }
}
