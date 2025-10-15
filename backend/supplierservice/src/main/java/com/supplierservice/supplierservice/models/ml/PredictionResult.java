package com.supplierservice.supplierservice.models.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.Map;

/**
 * Result from the ML prediction service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResult {
    // Probability score (0.0 to 1.0)
    private double probability;

    // Classification label (0 or 1)
    private int label;

    // Features used for prediction
    @Builder.Default
    private Map<String, Object> featuresUsed = Collections.emptyMap();

    // Error message if prediction failed
    private String errorMessage;

    // Success status
    private boolean success;

    // Create a successful prediction result
    public static PredictionResult success(double probability, int label) {
        return PredictionResult.builder()
                .probability(probability)
                .label(label)
                .success(true)
                .build();
    }

    // Create a failed prediction result
    public static PredictionResult failure(String errorMessage) {
        return PredictionResult.builder()
                .errorMessage(errorMessage)
                .success(false)
                .build();
    }
}