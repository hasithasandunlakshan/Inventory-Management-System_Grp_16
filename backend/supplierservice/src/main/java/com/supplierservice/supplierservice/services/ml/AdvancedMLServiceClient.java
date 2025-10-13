package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.models.ml.PredictionResult;
import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Exception thrown when there's a problem communicating with the ML service
 */
class MLServiceException extends RuntimeException {
    public MLServiceException(String message) {
        super(message);
    }

    public MLServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * Client for interacting with the ML service for supplier scoring and PO risk
 * prediction
 */
@Service
@Slf4j
public class MLServiceClient {

    private final RestTemplate restTemplate;
    private final String mlServiceBaseUrl;

    public MLServiceClient(RestTemplate restTemplate, @Value("${ml.service.url}") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceBaseUrl = mlServiceUrl;
        log.info("ML service client initialized with base URL: {}", mlServiceUrl);
    }

    /**
     * Method to send supplier features to ML service for prediction
     * 
     * @param features The features to use for prediction
     * @return The prediction score
     * @throws MLServiceException if there's a problem communicating with the ML
     *                            service
     */
    public Double predictSupplierPerformance(SupplierDailyFeatures features) {
        String url = mlServiceBaseUrl + "/predict";

        // Convert features to map for request
        Map<String, Object> requestBody = features.toMap();

        log.info("Sending prediction request to ML service at {}", url);
        log.debug("Request body: {}", requestBody);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    url, requestBody, new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            log.info("Received response from ML service: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Response body: {}", response.getBody());
                Object prediction = response.getBody().get("prediction");

                if (prediction instanceof Number) {
                    return ((Number) prediction).doubleValue();
                } else if (prediction instanceof String) {
                    try {
                        return Double.parseDouble((String) prediction);
                    } catch (NumberFormatException e) {
                        log.error("Failed to parse prediction as double: {}", prediction, e);
                        throw new MLServiceException("Invalid prediction format");
                    }
                } else if (prediction == null) {
                    log.error("Prediction is null in response: {}", response.getBody());
                    // Fallback to score if available in response
                    Object score = response.getBody().get("score");
                    if (score instanceof Number) {
                        return ((Number) score).doubleValue();
                    }
                    throw new MLServiceException("Null prediction received from ML service");
                }
            }

            throw new MLServiceException("Failed to get valid prediction from ML service");
        } catch (RestClientException e) {
            log.error("Failed to call ML service: {}", e.getMessage(), e);
            throw new MLServiceException("Failed to communicate with ML service", e);
        }
    }
}