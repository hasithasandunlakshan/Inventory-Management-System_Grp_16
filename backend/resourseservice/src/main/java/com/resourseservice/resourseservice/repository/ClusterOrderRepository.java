package com.resourseservice.resourseservice.repository;

import com.resourseservice.resourseservice.entity.ClusterOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClusterOrderRepository extends JpaRepository<ClusterOrder, Long> {

    List<ClusterOrder> findByOrderId(Long orderId);

    @Query("SELECT co FROM ClusterOrder co " +
            "WHERE co.deliveryCluster.clusterId = :clusterId " +
            "ORDER BY co.deliverySequence ASC")
    List<ClusterOrder> findByClusterIdOrderBySequence(@Param("clusterId") Long clusterId);

    @Query("SELECT co FROM ClusterOrder co " +
            "WHERE co.deliveryCluster.assignedDriverId = :driverId " +
            "AND co.deliveryStatus IN ('PENDING', 'IN_TRANSIT') " +
            "ORDER BY co.deliveryCluster.clusterId, co.deliverySequence ASC")
    List<ClusterOrder> findPendingDeliveriesByDriver(@Param("driverId") Long driverId);

    Optional<ClusterOrder> findByOrderIdAndDeliveryCluster_ClusterId(Long orderId, Long clusterId);

    boolean existsByOrderId(Long orderId);
}
