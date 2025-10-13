package com.supplierservice.supplierservice.config;

import com.supplierservice.supplierservice.services.ml.SupplierMetricsService;
import com.supplierservice.supplierservice.services.ml.SupplierModelService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MLConfig {

    @Bean
    public SupplierModelService supplierModelService(
            SupplierMetricsService metricsService,
            RestTemplate restTemplate,
            @Value("${ml.service.render.url:https://supplier-model.onrender.com/api/predict}") String renderMlEndpoint) {

        SupplierModelService modelService = new SupplierModelService(metricsService, restTemplate, renderMlEndpoint);
        modelService.initializeModel();
        return modelService;
    }
}