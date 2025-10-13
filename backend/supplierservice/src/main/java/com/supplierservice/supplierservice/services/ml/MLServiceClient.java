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
            String url = mlServiceUrl + "/supplier/predict/" + supplierId;

            // Convert features to map for API request
            Map<String, Object> featureMap = features.toMap();

            // Call ML service
            Map<String, Object> response = restTemplate.postForObject(
                    url,
                    featureMap,
                    Map.class);

            return response != null ? (double) response.get("performance_score") : 0.0;

        } catch (Exception e) {
            log.error("Failed to get prediction from ML service for supplier {}", supplierId, e);
            return 0.0; // Default score on failure
        }
    }
}