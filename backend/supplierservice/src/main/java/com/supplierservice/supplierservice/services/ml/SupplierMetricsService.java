package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.repository.SupplierRepository;
import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import com.supplierservice.supplierservice.models.ml.SupplierScoreDaily;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierMetricsService {
    private final SupplierRepository supplierRepository;
    private final MLServiceClient mlServiceClient;

    @Transactional
    public void computeDailyScores(LocalDate asOf, boolean dryRun) {
        long suppliers = supplierRepository.count();
        log.info("[ETL] asOf={} suppliers={} dryRun={}", asOf, suppliers, dryRun);
        if (dryRun)
            return;

        supplierRepository.findAll().forEach(supplier -> {
            try {
                // 1. Compute features
                SupplierDailyFeatures features = computeSupplierFeatures(supplier.getSupplierId(), asOf);

                // 2. Get model prediction via external Render-hosted model
                double predictionScore = mlServiceClient.getSupplierPrediction(supplier.getSupplierId(), features);

                // 3. Create and save daily score
                SupplierScoreDaily score = SupplierScoreDaily.builder()
                        .supplierId(supplier.getSupplierId())
                        .scoreDate(asOf)
                        .onTimeRate30d(features.getOtif30d())
                        .inFullRate30d(features.getDefectRate180d())
                        .avgLateDays30d(features.getLateRate30d())
                        .medianLeadTime90d(features.getMedianLeadTime90d())
                        .leadTimeIqr90d(features.getLeadTimeIqr90d())
                        .priceIndex30d(features.getPriceIndex30d())
                        .createdAt(LocalDateTime.now())
                        .build();

                // TODO: Save score to database
                log.info("Computed score for supplier {}: {}", supplier.getSupplierId(), predictionScore);

            } catch (Exception e) {
                log.error("Failed to compute score for supplier {}", supplier.getSupplierId(), e);
            }
        });
    }

    private SupplierDailyFeatures computeSupplierFeatures(Long supplierId, LocalDate asOf) {
        // TODO: Implement feature computation logic
        // This should calculate all the metrics needed for the model
        return SupplierDailyFeatures.builder()
                .supplierId(supplierId)
                .featureDate(asOf)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
