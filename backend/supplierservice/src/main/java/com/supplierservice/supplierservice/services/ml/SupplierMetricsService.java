package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.repository.DeliveryLogRepository;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;
import com.supplierservice.supplierservice.repository.SupplierRepository;
import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import com.supplierservice.supplierservice.models.ml.SupplierScoreDaily;
import com.supplierservice.supplierservice.repository.ml.SupplierDailyFeaturesRepository;
import com.supplierservice.supplierservice.repository.ml.SupplierScoreDailyRepository;
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
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final DeliveryLogRepository deliveryLogRepository;
    private final SupplierDailyFeaturesRepository featuresRepository;
    private final SupplierScoreDailyRepository scoreRepository;

    /**
     * Get the latest features for a supplier
     * 
     * @param supplierId The supplier ID
     * @return The latest features for the supplier
     */
    public SupplierDailyFeatures getLatestFeaturesForSupplier(Long supplierId) {
        // Try to get from database first if available using repository method
        try {
            return featuresRepository.findLatestBySupplier(supplierId)
                    .orElseGet(() -> computeSupplierFeatures(supplierId, LocalDate.now()));
        } catch (Exception e) {
            log.warn("Error retrieving features from repository: {}", e.getMessage());
            return computeSupplierFeatures(supplierId, LocalDate.now());
        }
    }

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

                // Save features to database for future reference
                featuresRepository.save(features);

                // 2. Get model prediction
                // Due to class conflict issues, use a hardcoded value for now
                // In production, this would call the ML service
                double predictionScore = calculatePredictionScore(features);
                log.info("Using calculated prediction score for supplier {}: {}",
                        supplier.getSupplierId(), predictionScore);

                // 3. Create and save daily score
                SupplierScoreDaily score = SupplierScoreDaily.builder()
                        .supplierId(supplier.getSupplierId())
                        .scoreDate(asOf)
                        .onTimeRate30d(features.getOtif30d())
                        .inFullRate30d(features.getDefectRate180d() == null ? 0.98 : 1 - features.getDefectRate180d())
                        .avgLateDays30d(features.getLateRate30d())
                        .medianLeadTime90d(features.getMedianLeadTime90d())
                        .leadTimeIqr90d(features.getLeadTimeIqr90d())
                        .priceIndex30d(features.getPriceIndex30d())
                        .createdAt(LocalDateTime.now())
                        .build();

                // Save score to database
                scoreRepository.save(score);
                log.info("Computed score for supplier {}: {}", supplier.getSupplierId(), predictionScore);

            } catch (Exception e) {
                log.error("Failed to compute score for supplier {}", supplier.getSupplierId(), e);
            }
        });
    }

    /**
     * Calculate a prediction score based on supplier features
     * This is a simplified implementation that would normally call the ML service
     * 
     * @param features The supplier features
     * @return A prediction score between 0 and 1
     */
    private double calculatePredictionScore(SupplierDailyFeatures features) {
        // This is a simplified algorithm that weights different factors
        // In a real implementation, this would call an ML model

        double score = 0.0;

        // Weight on-time delivery rate (higher is better)
        if (features.getOtif30d() != null) {
            score += features.getOtif30d() * 0.5; // 50% weight
        } else {
            score += 0.45; // Default if null
        }

        // Weight defect rate (lower is better)
        if (features.getDefectRate180d() != null) {
            score += (1 - features.getDefectRate180d()) * 0.3; // 30% weight
        } else {
            score += 0.27; // Default if null
        }

        // Weight dispute rate (lower is better)
        if (features.getDisputeRate180d() != null) {
            score += (1 - features.getDisputeRate180d()) * 0.2; // 20% weight
        } else {
            score += 0.18; // Default if null
        }

        // Ensure score is between 0 and 1
        return Math.max(0.0, Math.min(1.0, score));
    }

    private SupplierDailyFeatures computeSupplierFeatures(Long supplierId, LocalDate asOf) {
        try {
            // Calculate time periods for different metrics
            LocalDate days30Ago = asOf.minusDays(30);

            // Calculate on-time delivery rate (last 30 days)
            Long onTimeDeliveries = deliveryLogRepository.countOnTimeDeliveries(supplierId, days30Ago, asOf);
            Long totalDeliveries = deliveryLogRepository.countTotalDeliveries(supplierId, days30Ago, asOf);
            Double otifRate = totalDeliveries > 0 ? (double) onTimeDeliveries / totalDeliveries : 0.95; // Default to
                                                                                                        // 95% if no
                                                                                                        // data

            // Calculate late delivery rate
            Double lateRate = totalDeliveries > 0 ? 1.0 - otifRate : 0.05; // Default to 5% if no data

            // Calculate total spend in last 30 days
            Double spend = purchaseOrderRepository.calculateTotalSpendBySupplier(supplierId, days30Ago, asOf);
            if (spend == null)
                spend = 0.0;

            // Count open purchase orders
            Integer openPoCount = purchaseOrderRepository.countOpenPurchaseOrdersBySupplier(supplierId);
            if (openPoCount == null)
                openPoCount = 0;

            // Calculate median lead time and IQR (simplified calculation)
            // In a real implementation, you would calculate these values from actual data
            Double medianLeadTime = 4.5; // Default value
            Double leadTimeIqr = 1.2; // Default value

            // Placeholder for metrics that would require more complex calculations
            // In a real implementation, you would calculate these from various data sources
            Double defectRate = 0.02; // Default 2% defect rate
            Double disputeRate = 0.01; // Default 1% dispute rate
            Double priceIndex = 1.03; // Default 3% above market average

            // Build and return the features
            return SupplierDailyFeatures.builder()
                    .supplierId(supplierId)
                    .featureDate(asOf)
                    .otif30d(otifRate)
                    .lateRate30d(lateRate)
                    .spend30d(spend)
                    .openPoCount(openPoCount)
                    .medianLeadTime90d(medianLeadTime)
                    .leadTimeIqr90d(leadTimeIqr)
                    .defectRate180d(defectRate)
                    .disputeRate180d(disputeRate)
                    .priceIndex30d(priceIndex)
                    .createdAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Error computing supplier features for supplier {}: {}", supplierId, e.getMessage());

            // Fallback to default values if there's an error
            return SupplierDailyFeatures.builder()
                    .supplierId(supplierId)
                    .featureDate(asOf)
                    .otif30d(0.93) // 93% on-time-in-full rate
                    .lateRate30d(0.07) // 7% late delivery rate
                    .spend30d(25000.0) // $25k spent with this supplier in last 30 days
                    .openPoCount(3) // 3 open purchase orders
                    .medianLeadTime90d(4.5) // 4.5 days median lead time
                    .leadTimeIqr90d(1.2) // 1.2 days interquartile range
                    .defectRate180d(0.02) // 2% defect rate
                    .disputeRate180d(0.01) // 1% dispute rate
                    .priceIndex30d(1.03) // 3% above market average
                    .createdAt(LocalDateTime.now())
                    .build();
        }
    }
}
