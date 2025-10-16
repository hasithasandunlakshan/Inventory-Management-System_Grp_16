package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.DeliveryCluster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryClusterRepository extends JpaRepository<DeliveryCluster, Long> {

    Optional<DeliveryCluster> findByClusterName(String clusterName);

    boolean existsByClusterName(String clusterName);

    List<DeliveryCluster> findByStatus(DeliveryCluster.ClusterStatus status);

    List<DeliveryCluster> findByAssignedDriverId(Long driverId);

    @Query("SELECT dc FROM DeliveryCluster dc " +
            "LEFT JOIN FETCH dc.clusterOrders co " +
            "WHERE dc.assignedDriverId = :driverId " +
            "AND dc.status IN ('ASSIGNED', 'IN_PROGRESS') " +
            "ORDER BY dc.createdAt DESC")
    List<DeliveryCluster> findActiveClustersByDriver(@Param("driverId") Long driverId);

    @Query("SELECT dc FROM DeliveryCluster dc " +
            "LEFT JOIN FETCH dc.clusterOrders co " +
            "WHERE dc.clusterId = :clusterId")
    Optional<DeliveryCluster> findByIdWithOrders(@Param("clusterId") Long clusterId);

    @Query("SELECT dc FROM DeliveryCluster dc " +
            "WHERE dc.status = 'PENDING' " +
            "ORDER BY dc.createdAt DESC")
    List<DeliveryCluster> findPendingClusters();

    @Query("SELECT dc FROM DeliveryCluster dc " +
            "LEFT JOIN FETCH dc.clusterOrders co " +
            "WHERE dc.assignedDriverId = :driverId " +
            "AND dc.status = :status " +
            "ORDER BY co.deliverySequence ASC, dc.createdAt DESC")
    List<DeliveryCluster> findByDriverIdAndStatus(@Param("driverId") Long driverId, 
                                                   @Param("status") DeliveryCluster.ClusterStatus status);
}
