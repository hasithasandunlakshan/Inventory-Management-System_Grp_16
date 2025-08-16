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
            // User Service (Public + Secure)
            .route("user-service-auth", r -> r
                .path("/api/auth/**")
                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                .uri("http://localhost:8080"))
            .route("user-service-secure", r -> r
                .path("/api/secure/**")
                .filters(f -> f.filter(jwtAuthenticationFilter))
                .uri("http://localhost:8080"))

            // Product Service (MANAGER only)
            .route("product-service", r -> r
                .path("/api/products/**")
                .filters(f -> f.filter(jwtAuthenticationFilter))
                .uri("http://localhost:8081"))

            // Order Service (STOREKEEPER, MANAGER)
            .route("order-service-payments", r -> r
                .path("/api/payments/**")
                .filters(f -> f.filter(jwtAuthenticationFilter))
                .uri("http://localhost:8084"))
            .route("order-service-orders", r -> r
                .path("/api/orders/**")
                .filters(f -> f.filter(jwtAuthenticationFilter))
                .uri("http://localhost:8084"))

            // Inventory Service (STOREKEEPER, MANAGER)
            .route("inventory-service", r -> r
                .path("/api/inventory/**")
                .filters(f -> f.filter(jwtAuthenticationFilter))
                .uri("http://localhost:8083"))

            // Health Check
            .route("health-check", r -> r
                .path("/health")
                .uri("http://localhost:8090"))

            .build();
    }
}
