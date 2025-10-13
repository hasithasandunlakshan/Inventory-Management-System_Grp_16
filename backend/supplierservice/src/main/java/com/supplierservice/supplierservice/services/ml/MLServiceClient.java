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

            if (response == null)
                return 0.0;

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
}