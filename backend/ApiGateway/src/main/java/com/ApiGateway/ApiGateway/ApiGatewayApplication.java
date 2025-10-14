package com.ApiGateway.ApiGateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
                        @Value("${supplier.service.url:http://localhost:8082}") String supplierServiceUrl,
                        @Value("${ml.service.url:https://supplier-model.onrender.com}") String mlServiceUrl) {
                return builder.routes()

                                // User Service - Protected auth endpoints (require authentication)
                                .route("user-service-auth-protected", r -> r
                                                .path("/api/auth/users")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://userservice-337812374841.us-central1.run.app"))
                                // User Service - Public auth endpoints (login/signup)

                                // User Service - Public endpoints

                                .route("user-service-auth-public", r -> r
                                                .path("/api/auth/login", "/api/auth/signup")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri("https://userservice-337812374841.us-central1.run.app"))
                                // User Service - Secured endpoints (everything else under /api/auth/**)
                                .route("user-service-auth-secure", r -> r
                                                .path("/api/auth/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://userservice-337812374841.us-central1.run.app"))
                                .route("user-service-admin", r -> r
                                                .path("/api/admin/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://userservice-337812374841.us-central1.run.app"))
                                .route("user-service-secure", r -> r
                                                .path("/api/secure/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://userservice-337812374841.us-central1.run.app"))

                                // Product Service - Public access (Choreo)
                                .route("product-service", r -> r
                                                .path("/api/products/**")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/productservice-gw/v1.0"))

                                // Categories Service (part of Product Service) - Public access (Choreo)
                                .route("categories-service", r -> r
                                                .path("/api/categories/**")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/productservice-gw/v1.0"))

                                // Order Service (STOREKEEPER, MANAGER)
                                .route("order-service-payments", r -> r
                                                .path("/api/payments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://orderservice-337812374841.us-central1.run.app"))
                                .route("order-service-orders", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://orderservice-337812374841.us-central1.run.app"))

                                // Revenue Service (MANAGER) - New route for revenue endpoints
                                .route("revenue-service", r -> r
                                                .path("/api/revenue/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://orderservice-337812374841.us-central1.run.app"))

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

                                // Supplier Service (MANAGER, STOREKEEPER) - Local or Choreo
                                .route("supplier-service", r -> r
                                                .path("/api/delivery-logs/**", "/api/suppliers/**",
                                                                "/api/purchase-orders/**",
                                                                "/api/supplier-categories/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(supplierServiceUrl))

                                // ML Service - for Supplier Prediction and Analytics
                                .route("ml-service", r -> r
                                                .path("/api/ml/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri(mlServiceUrl))

                                // Resource Service - Driver Management (Public GET operations) - Choreo
                                .route("resource-service-drivers-public", r -> r
                                                .method("GET")
                                                .and()
                                                .path("/api/resources/drivers", "/api/resources/drivers/available")
                                                .filters(f -> f.addRequestHeader("X-Gateway", "API-Gateway"))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/resourseservice/v1.0"))

                                // Resource Service - Driver Management (Secured operations) - Choreo
                                .route("resource-service-drivers", r -> r
                                                .path("/api/resources/drivers/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/resourseservice/v1.0"))

                                // Resource Service - Vehicle Management (Secured operations) - Choreo
                                .route("resource-service-vehicles", r -> r
                                                .path("/api/resources/vehicles/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/resourseservice/v1.0"))

                                // Resource Service - Assignment Management (Secured operations) - Choreo
                                .route("resource-service-assignments", r -> r
                                                .path("/api/resources/assignments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter))
                                                .uri("https://d201c53c-c644-4920-ab04-ef977962e680-dev.e1-us-east-azure.choreoapis.dev/invfentory/resourseservice/v1.0"))

                                // Health Check - Simple response (no external service)
                                .route("health-check", r -> r
                                                .path("/health")
                                                .filters(f -> f.setStatus(200))
                                                .uri("no://op"))

                                .build();
        }
}
