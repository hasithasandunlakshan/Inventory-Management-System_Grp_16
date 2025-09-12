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
        System.out.println("🔍 JWT Filter - Processing request to path: " + path);
        System.out.println("🔍 JWT Filter - Full URL: " + request.getURI());
        System.out.println("🔍 JWT Filter - Method: " + request.getMethod());

        // Skip JWT validation only for public auth endpoints (login/signup)
        if (path.equals("/api/auth/login") || path.equals("/api/auth/signup")) {
            System.out.println("🔍 JWT Filter - Public endpoint, skipping JWT validation");
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return handleError(response, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                System.out.println("🔍 JWT Filter - Invalid token");
                return handleError(response, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);
            String email = jwtUtil.extractEmail(token);

            System.out.println(
                    "🔍 JWT Filter - Token valid, userId: " + userId + ", username: " + username + ", role: " + role);

            System.out.println("🔍 JWT Filter - About to check access for path: " + path + " with role: " + role);
            boolean hasAccessResult = hasAccess(path, role);
            System.out.println("🔍 JWT Filter - hasAccess result: " + hasAccessResult);

            if (!hasAccessResult) {
                System.out.println("🔍 JWT Filter - Access denied for path: " + path + " with role: " + role);
                return handleError(response, "Access denied", HttpStatus.FORBIDDEN);
            }

            System.out.println("🔍 JWT Filter - Access granted, proceeding with request");

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
        // Debug logging
        System.out.println("🔍 JWT Filter Debug - Path: " + path + ", Role: " + role);

        // Normalize role for case/spacing differences
        final String roleUpper = role == null ? "" : role.toUpperCase();
        final String roleCompact = roleUpper.replace(" ", "");

        // Helper: exact role match check
        java.util.function.Predicate<String> has = r -> {
            String rUpper = r.toUpperCase();
            String rCompact = rUpper.replace(" ", "");
            boolean result1 = roleUpper.equals(rUpper);
            boolean result2 = roleCompact.equals(rCompact);
            boolean result = result1 || result2;
            System.out.println("🔍 Role check - Testing: '" + r + "'");
            System.out.println("🔍 Role check - rUpper: '" + rUpper + "', rCompact: '" + rCompact + "'");
            System.out.println("🔍 Role check - roleUpper: '" + roleUpper + "', roleCompact: '" + roleCompact + "'");
            System.out.println("🔍 Role check - result1 (equals): " + result1 + ", result2 (compact equals): " + result2
                    + ", final result: " + result);
            return result;
        };

        // User service - specific endpoints
        if (path.startsWith("/api/secure")) {
            System.out.println("🔍 Matched /api/secure - allowing access");
            return true;
        }

        // User service - /api/auth/users requires MANAGER or ADMIN
        if (path.startsWith("/api/auth/users")) {
            System.out.println("🔍 /api/auth/users - Starting role check");
            System.out.println("🔍 /api/auth/users - Original role: '" + role + "'");
            System.out.println("🔍 /api/auth/users - roleUpper: '" + roleUpper + "'");
            System.out.println("🔍 /api/auth/users - roleCompact: '" + roleCompact + "'");

            boolean hasManager = has.test("MANAGER");
            boolean hasAdmin = has.test("ADMIN");
            boolean result = hasManager || hasAdmin;

            System.out.println("🔍 /api/auth/users check - hasManager: " + hasManager + ", hasAdmin: " + hasAdmin
                    + ", result: " + result);
            return result;
        }

        // User service - other auth endpoints allow all authenticated
        if (path.startsWith("/api/auth")) {
            System.out.println("🔍 Matched /api/auth - allowing access");
            return true;
        }

        // Admin endpoints - ADMIN or MANAGER only
        if (path.startsWith("/api/admin")) {
            return has.test("ADMIN") || has.test("MANAGER");
        }

        // Product service - MANAGER only
        if (path.startsWith("/api/products")) {
            return has.test("MANAGER");
        }

        // Order service - STOREKEEPER, MANAGER
        if (path.startsWith("/api/orders") || path.startsWith("/api/payments")) {
            return has.test("STORE KEEPER") || has.test("STOREKEEPER") || has.test("MANAGER");
        }

        // Revenue service - MANAGER only
        if (path.startsWith("/api/revenue")) {
            return has.test("MANAGER");
        }

        // Inventory service - STOREKEEPER, MANAGER
        if (path.startsWith("/api/inventory")) {
            return has.test("STORE KEEPER") || has.test("STOREKEEPER") || has.test("MANAGER") || has.test("ADMIN");
        }

        // Stock alerts - STOREKEEPER, MANAGER, ADMIN
        if (path.startsWith("/api/stock-alerts")) {
            return has.test("STORE KEEPER") || has.test("STOREKEEPER") || has.test("MANAGER") || has.test("ADMIN");
        }

        // Supplier service - STOREKEEPER, MANAGER, ADMIN
        if (path.startsWith("/api/suppliers") || path.startsWith("/api/delivery-logs")
                || path.startsWith("/api/purchase-orders") || path.startsWith("/api/supplier-categories")) {
            return has.test("STORE KEEPER") || has.test("STOREKEEPER") || has.test("MANAGER") || has.test("ADMIN");
        }

        // Resource service - Driver/Vehicle management - MANAGER, ADMIN only
        if (path.startsWith("/api/resources")) {
            System.out.println("🔍 /api/resources - Checking authorization for MANAGER/ADMIN");
            boolean hasManager = has.test("MANAGER");
            boolean hasAdmin = has.test("ADMIN");
            boolean result = hasManager || hasAdmin;
            System.out.println("🔍 /api/resources check - hasManager: " + hasManager + ", hasAdmin: " + hasAdmin
                    + ", result: " + result);
            return result;
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
