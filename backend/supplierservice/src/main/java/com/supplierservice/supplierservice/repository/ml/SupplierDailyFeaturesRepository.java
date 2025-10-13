package com.supplierservice.supplierservice.repository.ml;

import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface SupplierDailyFeaturesRepository extends JpaRepository<SupplierDailyFeatures, Long> {
    Optional<SupplierDailyFeatures> findBySupplierIdAndFeatureDate(Long supplierId, LocalDate date);

    @Query("SELECT f FROM SupplierDailyFeatures f WHERE f.supplierId = :supplierId " +
            "ORDER BY f.featureDate DESC")
    Optional<SupplierDailyFeatures> findLatestBySupplier(@Param("supplierId") Long supplierId);
}
