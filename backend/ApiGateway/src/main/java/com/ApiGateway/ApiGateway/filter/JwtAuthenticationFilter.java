package com.ApiGateway.ApiGateway.filter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.ApiGateway.ApiGateway.util.JwtUtil;

import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GatewayFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        String path = request.getPath().value();

        // Skip JWT validation for auth endpoints (login/signup)
        if (path.startsWith("/api/auth")) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return handleError(response, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                return handleError(response, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);
            String email = jwtUtil.extractEmail(token);

            if (!hasAccess(path, role)) {
                return handleError(response, "Access denied", HttpStatus.FORBIDDEN);
            }

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId.toString())
                    .header("X-Username", username)
                    .header("X-User-Email", email)
                    .header("X-User-Roles", String.join(",", role))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            return handleError(response, "Token validation failed", HttpStatus.UNAUTHORIZED);
        }
    }

    private boolean hasAccess(String path, String role) {
        // User service - allow all authenticated
        if (path.startsWith("/api/secure") || path.startsWith("/api/auth")) {
            return true;
        }

        // Admin endpoints - ADMIN or MANAGER only
        if (path.startsWith("/api/admin")) {
            return role.contains("ADMIN") || role.contains("MANAGER");
        }

        // Product service - MANAGER only
        if (path.startsWith("/api/products")) {
            return role.contains("MANAGER");
        }

        // Order service - STOREKEEPER, MANAGER
        if (path.startsWith("/api/orders") || path.startsWith("/api/payments")) {
            return role.contains("Store Keeper") || role.contains("MANAGER");
        }

        // Inventory service - STOREKEEPER, MANAGER
        if (path.startsWith("/api/inventory")) {
            return role.contains("Store Keeper") || role.contains("MANAGER");
        }

        // Supplier service - STOREKEEPER, MANAGER, ADMIN
        if (path.startsWith("/api/suppliers") || path.startsWith("/api/delivery-logs")
                || path.startsWith("/api/purchase-orders")) {
            return role.contains("Store Keeper") || role.contains("MANAGER") || role.contains("ADMIN");
        }

        return false;
    }

    private Mono<Void> handleError(ServerHttpResponse response, String message, HttpStatus status) {
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String errorBody = "{\"error\":\"" + message + "\",\"status\":" + status.value() + "}";
        var buffer = response.bufferFactory().wrap(errorBody.getBytes());
        return response.writeWith(Mono.just(buffer));
    }
}
