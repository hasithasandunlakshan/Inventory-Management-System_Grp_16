package com.supplierservice.supplierservice.repository.ml;

import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface SupplierDailyFeaturesRepository extends JpaRepository<SupplierDailyFeatures, Long> {
    Optional<SupplierDailyFeatures> findBySupplierIdAndFeatureDate(Long supplierId, LocalDate date);
}
