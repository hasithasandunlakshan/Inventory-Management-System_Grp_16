package com.supplierservice.supplierservice.services.ml;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierModelService {

    private final SupplierMetricsService metricsService;

    // Using local implementation instead of external ML service to avoid API
    // dependencies
    private static final String MODEL_STATUS = "local_implementation";

    public void initializeModel() {
        try {
            log.info("Using local ML model implementation: {}", MODEL_STATUS);
            log.info("ML Model initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize ML model", e);
            throw new RuntimeException("Model initialization failed", e);
        }
    }

    public double predictSupplierPerformance(SupplierDailyFeatures features) {
        try {
            // Use the local calculation method
            return calculateReliabilityScore(features);
        } catch (Exception e) {
            log.error("Prediction failed for supplier {}", features.getSupplierId(), e);
            throw new RuntimeException("Prediction failed", e);
        }
    }

    public Map<String, Object> getRawPrediction(Long supplierId, Map<String, Object> features) {
        try {
            // Create a simplified prediction response with core metrics
            Map<String, Object> result = new HashMap<>();
            result.put("supplier_id", supplierId);
            result.put("prediction_time", LocalDate.now().toString());
            result.put("features_used", features);

            // Get latest features from the metrics service to calculate the score
            SupplierDailyFeatures supplierFeatures = metricsService.getLatestFeaturesForSupplier(supplierId);
            if (supplierFeatures != null) {
                result.put("reliability_score", calculateReliabilityScore(supplierFeatures));
            } else {
                result.put("reliability_score", 0.75); // Default fallback score
            }

            return result;
        } catch (Exception e) {
            log.error("Raw prediction failed for supplier {}", supplierId, e);
            throw new RuntimeException("Raw prediction failed", e);
        }
    }

    /**
     * Calculate reliability score based on supplier features.
     * This implements a simplified local scoring algorithm.
     */
    private double calculateReliabilityScore(SupplierDailyFeatures features) {
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
}