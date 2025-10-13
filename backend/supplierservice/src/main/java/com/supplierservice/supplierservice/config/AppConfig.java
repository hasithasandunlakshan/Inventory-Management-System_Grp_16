package com.supplierservice.supplierservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for beans used in the supplier service
 */
@Configuration
public class AppConfig {

    /**
     * Create a RestTemplate bean for making HTTP requests
     * This is used by the MLServiceClient to call the external ML service
     * 
     * @return RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}