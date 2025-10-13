package com.supplierservice.supplierservice.services.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDate;

@Service
@Slf4j
public class SupplierModelService {

    private final SupplierMetricsService metricsService;
    private final RestTemplate restTemplate;
    private final String renderMlEndpoint;

    /**
     * Constructor for SupplierModelService
     * 
     * @param metricsService   The supplier metrics service
     * @param restTemplate     RestTemplate for HTTP calls
     * @param renderMlEndpoint The Render ML API endpoint URL from config
     */
    public SupplierModelService(
            SupplierMetricsService metricsService,
            RestTemplate restTemplate,
            @Value("${ml.service.render.url:https://supplier-risk-prediction.onrender.com/api/predict}") String renderMlEndpoint) {
        this.metricsService = metricsService;
        this.restTemplate = restTemplate;
        this.renderMlEndpoint = renderMlEndpoint;
        log.info("SupplierModelService initialized with Render ML endpoint: {}", renderMlEndpoint);
    }

    public void initializeModel() {
        try {
            log.info("Using Render ML service: {}", renderMlEndpoint);
            // Ping the service to check if it's available
            Map<String, Object> pingRequest = Map.of("action", "ping");
            try {
                restTemplate.postForEntity(renderMlEndpoint + "/health", pingRequest, Map.class);
                log.info("ML Model service is available");
            } catch (Exception e) {
                log.warn("ML Model service health check failed: {}. Will fall back to local calculation if needed.",
                        e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to initialize ML model", e);
            throw new RuntimeException("Model initialization failed", e);
        }
    }

    public double predictSupplierPerformance(SupplierDailyFeatures features) {
        try {
            // Call the Render ML API endpoint
            log.info("Calling Render ML API for supplier {}", features.getSupplierId());

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Prepare request body
            Map<String, Object> requestBody = features.toMap();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Make API call using exchange with ParameterizedTypeReference
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    renderMlEndpoint,
                    org.springframework.http.HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Extract the prediction score from response
                Map<String, Object> body = new HashMap<>(response.getBody());
                log.debug("Received response from Render ML API: {}", body);

                // Try to extract prediction with various possible field names
                Object prediction = body.get("prediction");
                if (prediction == null)
                    prediction = body.get("score");
                if (prediction == null)
                    prediction = body.get("reliability_score");

                if (prediction instanceof Number) {
                    return ((Number) prediction).doubleValue();
                } else if (prediction instanceof String) {
                    try {
                        return Double.parseDouble((String) prediction);
                    } catch (NumberFormatException e) {
                        log.warn("Could not parse prediction value: {}", prediction);
                    }
                }

                log.warn("Could not extract prediction from response, using fallback calculation");
            } else {
                log.warn("ML API call failed with status: {}", response.getStatusCode());
            }

            // Fallback to local calculation if API call fails or returns invalid response
            log.info("Using fallback local calculation for supplier {}", features.getSupplierId());
            return calculateReliabilityScore(features);

        } catch (Exception e) {
            log.error("Prediction failed for supplier {}", features.getSupplierId(), e);
            log.info("Using fallback local calculation due to error");
            // Fallback to local calculation on error
            return calculateReliabilityScore(features);
        }
    }

    public Map<String, Object> getRawPrediction(Long supplierId, Map<String, Object> features) {
        try {
            // Call the Render ML API endpoint with raw features
            log.info("Calling Render ML API with raw features for supplier {}", supplierId);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Add supplier ID to features if not already present
            if (!features.containsKey("supplier_id")) {
                features.put("supplier_id", supplierId);
            }

            // Prepare request body
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(features, headers);

            // Make API call - using exchange with ParameterizedTypeReference
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    renderMlEndpoint + "/supplier/" + supplierId,
                    org.springframework.http.HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Return the raw response from the ML service
                Map<String, Object> mlResponse = new HashMap<>(response.getBody());

                // Add metadata
                mlResponse.put("supplier_id", supplierId);
                mlResponse.put("prediction_time", LocalDate.now().toString());
                mlResponse.put("features_used", features);
                mlResponse.put("source", "render_ml_api");

                log.info("Successfully received prediction from Render ML API for supplier {}", supplierId);
                return mlResponse;
            } else {
                log.warn("ML API call failed with status: {}", response.getStatusCode());
            }

            // Fallback to local calculation if API call fails
            log.info("Using fallback local calculation for raw prediction for supplier {}", supplierId);

            Map<String, Object> result = new HashMap<>();
            result.put("supplier_id", supplierId);
            result.put("prediction_time", LocalDate.now().toString());
            result.put("features_used", features);
            result.put("source", "local_fallback");

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

            // Return error response rather than throwing exception
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("supplier_id", supplierId);
            errorResponse.put("prediction_time", LocalDate.now().toString());
            errorResponse.put("features_used", features);
            errorResponse.put("source", "error_fallback");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("reliability_score", 0.5); // Default error fallback

            return errorResponse;
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