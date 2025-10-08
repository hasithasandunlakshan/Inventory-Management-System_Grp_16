package com.ApiGateway.ApiGateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

import com.ApiGateway.ApiGateway.config.ServiceConfig;
import com.ApiGateway.ApiGateway.filter.JwtAuthenticationFilter;

@SpringBootApplication
@EnableConfigurationProperties(ServiceConfig.class)
public class ApiGatewayApplication {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Autowired
        private ServiceConfig serviceConfig;

        public static void main(String[] args) {
                SpringApplication.run(ApiGatewayApplication.class, args);
        }

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()

                                // User Service - Protected auth endpoints (require authentication)
                                .route("user-service-auth-protected", r -> r
                                                .path("/api/auth/users")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getUserServiceUrl()))
                                // User Service - Public auth endpoints (login/signup)

                                // User Service - Public endpoints

                                .route("user-service-auth-public", r -> r
                                                .path("/api/auth/login", "/api/auth/signup")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri(serviceConfig.getUserServiceUrl()))
                                // User Service - Secured endpoints (everything else under /api/auth/**)
                                .route("user-service-auth-secure", r -> r
                                                .path("/api/auth/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getUserServiceUrl()))
                                .route("user-service-admin", r -> r
                                                .path("/api/admin/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getUserServiceUrl()))
                                .route("user-service-secure", r -> r
                                                .path("/api/secure/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getUserServiceUrl()))

                                // Product Service - Public access
                                .route("product-service", r -> r
                                                .path("/api/products/**")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri(serviceConfig.getProductServiceUrl()))

                                // Categories Service (part of Product Service) - Public access
                                .route("categories-service", r -> r
                                                .path("/api/categories/**")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri(serviceConfig.getProductServiceUrl()))

                                // Order Service (STOREKEEPER, MANAGER)
                                .route("order-service-payments", r -> r
                                                .path("/api/payments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getOrderServiceUrl()))
                                .route("order-service-orders", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getOrderServiceUrl()))

                                // Revenue Service (MANAGER) - New route for revenue endpoints
                                .route("revenue-service", r -> r
                                                .path("/api/revenue/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getOrderServiceUrl()))

                                // Inventory Service (STOREKEEPER, MANAGER)
                                .route("inventory-service", r -> r
                                                .path("/api/inventory/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getInventoryServiceUrl()))

                                // Stock Alerts (STOREKEEPER, MANAGER)
                                .route("stock-alerts", r -> r
                                                .path("/api/stock-alerts/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getInventoryServiceUrl()))

                                // Supplier Service (MANAGER, STOREKEEPER)
                                .route("supplier-service", r -> r
                                                .path("/api/delivery-logs/**", "/api/suppliers/**",
                                                                "/api/purchase-orders/**",
                                                                "/api/supplier-categories/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getSupplierServiceUrl()))

                                // Resource Service - Driver Management (Public GET operations)
                                .route("resource-service-drivers-public", r -> r
                                                .method("GET")
                                                .and()
                                                .path("/api/resources/drivers", "/api/resources/drivers/available")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri(serviceConfig.getResourceServiceUrl()))

                                // Resource Service - Driver Management (Secured operations)
                                .route("resource-service-drivers", r -> r
                                                .path("/api/resources/drivers/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getResourceServiceUrl()))

                                // Resource Service - Vehicle Management (Secured operations)
                                .route("resource-service-vehicles", r -> r
                                                .path("/api/resources/vehicles/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getResourceServiceUrl()))

                                // Resource Service - Assignment Management (Secured operations)
                                .route("resource-service-assignments", r -> r
                                                .path("/api/resources/assignments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(serviceConfig.getResourceServiceUrl()))

                                // Health Check - External
                                .route("health-check", r -> r
                                                .path("/health")
                                                .uri(serviceConfig.getHealthServiceUrl()))

                                // API Gateway Health Endpoints - Internal (handled by HealthController)
                                // These are handled by the local HealthController, not routed

                                .build();
        }
}
