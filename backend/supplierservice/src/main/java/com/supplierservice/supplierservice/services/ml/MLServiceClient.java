package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public double getSupplierPrediction(Long supplierId, SupplierDailyFeatures features) {
        try {
            // Build target URL. By default we POST to {ml.service.url}/predict
            String url = mlServiceUrl;
            if (!url.endsWith("/"))
                url += "/";
            url += "predict"; // configurable if you change the endpoint on Render

            // Build payload using mapper utility
            Map<String, Object> featureMap = SupplierFeatureMapper.toFeatureMap(supplierId, features);

            // Call ML service. RestTemplate returns a raw Map; cast to Map<String,Object>.
            @SuppressWarnings("unchecked")
            Map<String, Object> rawResponse = restTemplate.postForObject(url, featureMap, Map.class);

            if (rawResponse == null)
                return 0.0;

            // Extract score
            Object scoreObj = rawResponse.get("performance_score");

            if (scoreObj instanceof Number) {
                return ((Number) scoreObj).doubleValue();
            }
            // If API returns string numeric
            if (scoreObj instanceof String) {
                try {
                    return Double.parseDouble((String) scoreObj);
                } catch (NumberFormatException ignored) {
                }
            }
            // Fallback to 0.0 if missing/unparseable
            return 0.0;

        } catch (Exception e) {
            log.error("Failed to get prediction from ML service for supplier {}", supplierId, e);
            return 0.0; // Default score on failure
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