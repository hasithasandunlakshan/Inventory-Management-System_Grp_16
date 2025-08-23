package com.supplierservice.supplierservice.repository.ml;

import com.supplierservice.supplierservice.models.ml.SupplierScoreDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface SupplierScoreDailyRepository extends JpaRepository<SupplierScoreDaily, Long> {
    Optional<SupplierScoreDaily> findTopBySupplierIdOrderByScoreDateDesc(Long supplierId);

    Optional<SupplierScoreDaily> findBySupplierIdAndScoreDate(Long supplierId, LocalDate date);
}
