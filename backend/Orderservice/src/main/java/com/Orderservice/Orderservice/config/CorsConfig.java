package com.Orderservice.Orderservice.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class CorsConfig {

    // CORS is now handled by API Gateway
    // Removing this configuration to prevent duplicate CORS headers

    /*
     * Previous CORS filter configuration was moved to API Gateway
     * to ensure consistent CORS handling across all microservices.
     */
}
