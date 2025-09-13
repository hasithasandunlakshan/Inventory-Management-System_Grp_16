package com.ApiGateway.ApiGateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

import com.ApiGateway.ApiGateway.filter.JwtAuthenticationFilter;

@SpringBootApplication
public class ApiGatewayApplication {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

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
                                                .uri("http://localhost:8080"))
                                // User Service - Public auth endpoints (login/signup)
                                .route("user-service-auth-public", r -> r
                                                .path("/api/auth/login", "/api/auth/signup")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri("http://localhost:8080"))
                                .route("user-service-admin", r -> r
                                                .path("/api/admin/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8080"))
                                .route("user-service-secure", r -> r
                                                .path("/api/secure/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8080"))

                                // Product Service (MANAGER only)
                                .route("product-service", r -> r
                                                .path("/api/products/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8083"))

                                // Order Service (STOREKEEPER, MANAGER)
                                .route("order-service-payments", r -> r
                                                .path("/api/payments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8084"))
                                .route("order-service-orders", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8084"))
                                
                                // Revenue Service (MANAGER) - New route for revenue endpoints
                                .route("revenue-service", r -> r
                                                .path("/api/revenue/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8084"))

                                // Inventory Service (STOREKEEPER, MANAGER)
                                .route("inventory-service", r -> r
                                                .path("/api/inventory/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8085"))

                                // Stock Alerts (STOREKEEPER, MANAGER)
                                .route("stock-alerts", r -> r
                                                .path("/api/stock-alerts/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8085"))

                                // Supplier Service (MANAGER, STOREKEEPER)
                                .route("supplier-service", r -> r
                                                .path("/api/delivery-logs/**", "/api/suppliers/**",
                                                                "/api/purchase-orders/**",
                                                                "/api/supplier-categories/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("http://localhost:8082"))

                                // Health Check
                                .route("health-check", r -> r
                                                .path("/health")
                                                .uri("http://localhost:8090"))

                                .build();
        }
}
