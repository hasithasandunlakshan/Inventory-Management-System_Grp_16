package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    /**
     * Get the configured ML service URL
     * 
     * @return The ML service URL
     */
    public String getServiceUrl() {
        return mlServiceUrl;
    }

    /**
     * Get prediction score for a supplier using the ML service
     * 
     * @param supplierId The supplier ID
     * @param features   The features to use for prediction
     * @return The prediction score
     */
    public double getSupplierPrediction(Long supplierId, SupplierDailyFeatures features) {
        try {
            // Build target URL. By default we POST to {ml.service.url}/predict
            String url = mlServiceUrl;
            if (!url.endsWith("/"))
                url += "/";
            url += "predict"; // configurable if you change the endpoint on Render

            log.info("Sending prediction request to ML service at {} for supplier {}", url, supplierId);

            // Build payload using mapper utility
            Map<String, Object> featureMap = SupplierFeatureMapper.toFeatureMap(supplierId, features);

            // Call ML service. RestTemplate returns a raw Map; cast to Map<String,Object>.
            @SuppressWarnings("unchecked")
            Map<String, Object> rawResponse = restTemplate.postForObject(url, featureMap, Map.class);

            if (rawResponse == null) {
                log.warn("Received null response from ML service for supplier {}", supplierId);
                return 0.0;
            }

            log.debug("Received response from ML service: {}", rawResponse);

            // Extract score - try different possible field names used by the ML service
            Object scoreObj = rawResponse.get("performance_score");
            if (scoreObj == null) {
                scoreObj = rawResponse.get("prediction");
            }
            if (scoreObj == null) {
                scoreObj = rawResponse.get("score");
            }

            if (scoreObj instanceof Number) {
                return ((Number) scoreObj).doubleValue();
            }
            // If API returns string numeric
            if (scoreObj instanceof String) {
                try {
                    return Double.parseDouble((String) scoreObj);
                } catch (NumberFormatException ignored) {
                    log.warn("Could not parse score as number: {}", scoreObj);
                }
            }
            // Fallback to 0.0 if missing/unparseable
            log.warn("Could not extract score from ML service response for supplier {}", supplierId);
            return 0.0;

        } catch (Exception e) {
            log.error("Failed to get prediction from ML service for supplier {}", supplierId, e);
            return 0.0; // Default score on failure
        }
    }

    /**
     * Alternative method for getting prediction with individual feature parameters
     * 
     * @param supplierId        The supplier ID
     * @param otif30d           On-time-in-full rate (30 days)
     * @param lateRate30d       Late delivery rate (30 days)
     * @param spend30d          Spend amount (30 days)
     * @param openPoCount       Open purchase order count
     * @param medianLeadTime90d Median lead time (90 days)
     * @param leadTimeIqr90d    Lead time interquartile range (90 days)
     * @param defectRate180d    Defect rate (180 days)
     * @param disputeRate180d   Dispute rate (180 days)
     * @param priceIndex30d     Price index (30 days)
     * @return The prediction score
     */
    public double getSupplierPrediction(
            Long supplierId,
            Double otif30d,
            Double lateRate30d,
            Double spend30d,
            Integer openPoCount,
            Double medianLeadTime90d,
            Double leadTimeIqr90d,
            Double defectRate180d,
            Double disputeRate180d,
            Double priceIndex30d) {

        // Create a features object from the parameters
        SupplierDailyFeatures features = SupplierDailyFeatures.builder()
                .supplierId(supplierId)
                .otif30d(otif30d)
                .lateRate30d(lateRate30d)
                .spend30d(spend30d)
                .openPoCount(openPoCount)
                .medianLeadTime90d(medianLeadTime90d)
                .leadTimeIqr90d(leadTimeIqr90d)
                .defectRate180d(defectRate180d)
                .disputeRate180d(disputeRate180d)
                .priceIndex30d(priceIndex30d)
                .featureDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .build();

        // Use the existing method to get the prediction
        return getSupplierPrediction(supplierId, features);
    }

    /**
     * Call the ML service to get raw prediction response for a supplier
     * 
     * @param supplierId The supplier ID
     * @param features   The features to use for prediction
     * @return The raw prediction response as a Map
     */
    public Map<String, Object> getSupplierPredictionRaw(Long supplierId, Map<String, Object> features) {
        try {
            String url = mlServiceUrl;
            if (!url.endsWith("/"))
                url += "/";
            url += "supplier/predict/" + supplierId;

            @SuppressWarnings("unchecked")
            Map<String, Object> rawResponse = restTemplate.postForObject(url, features, Map.class);

            if (rawResponse == null) {
                return Map.of("error", "No response from ML service");
            }

            return rawResponse;
        } catch (Exception e) {
            log.error("Failed to get prediction from ML service for supplier {}", supplierId, e);
            return Map.of(
                    "error", "Prediction failed: " + e.getMessage(),
                    "supplier_id", supplierId);
        }
    }

    /**
     * Call the hosted Render model to predict PO success probability and label.
     * The Render endpoint for PO predictions is /predict-po-risk
     */
    public PredictionResult predictPoRisk(Map<String, Object> requestBody) {
        try {
            String url = mlServiceUrl;
            if (!url.endsWith("/"))
                url += "/";
            url += "predict-po-risk";

            @SuppressWarnings("unchecked")
            Map<String, Object> rawResponse = restTemplate.postForObject(url, requestBody, Map.class);
            PredictionResult r = new PredictionResult();
            if (rawResponse == null)
                return r;

            Object prob = rawResponse.get("probability");
            if (prob instanceof Number)
                r.setProbability(((Number) prob).doubleValue());
            else if (prob instanceof String) {
                try {
                    r.setProbability(Double.parseDouble((String) prob));
                } catch (Exception ignored) {
                }
            }

            Object label = rawResponse.get("label");
            if (label instanceof Number)
                r.setLabel(((Number) label).intValue());
            else if (label instanceof String) {
                try {
                    r.setLabel(Integer.parseInt((String) label));
                } catch (Exception ignored) {
                }
            }

            Object featuresUsed = rawResponse.get("features_used");
            if (featuresUsed instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> fu = (Map<String, Object>) featuresUsed;
                r.setFeaturesUsed(fu);
            }

            return r;
        } catch (Exception e) {
            log.error("PO risk prediction failed", e);
            return new PredictionResult();
        }
    }
}