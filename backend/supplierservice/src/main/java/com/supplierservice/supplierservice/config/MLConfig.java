package com.supplierservice.supplierservice.config;

import com.supplierservice.supplierservice.services.ml.SupplierModelService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MLConfig {

    @Bean
    public SupplierModelService supplierModelService() {
        SupplierModelService modelService = new SupplierModelService();
        modelService.initializeModel();
        return modelService;
    }
}