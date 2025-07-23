package com.InventoryMangementSystem.userservice.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;

    public JwtAuthFilter(JwtTokenUtil jwtTokenUtil) {
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = null;

        System.out.println("=== JWT FILTER DEBUG ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + (header != null ? header.substring(0, Math.min(20, header.length())) + "..." : "null"));

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("Extracted Token: " + token.substring(0, Math.min(20, token.length())) + "...");
        }

        if (token != null) {
            try {
                boolean isValid = jwtTokenUtil.validateToken(token);
                System.out.println("Token validation result: " + isValid);
                
                if (isValid) {
                    Claims claims = jwtTokenUtil.getClaimsFromToken(token);
                    System.out.println("Claims extracted - userId: " + claims.get("userId") + 
                                     ", email: " + claims.get("email") + 
                                     ", role: " + claims.get("role"));
                    request.setAttribute("userId", claims.get("userId"));
                    request.setAttribute("email", claims.get("email"));
                    request.setAttribute("role", claims.get("role"));
                }
            } catch (Exception e) {
                System.err.println("JWT validation error: " + e.getMessage());
                e.printStackTrace();
            }
        }
        System.out.println("=== JWT FILTER END ===");

        filterChain.doFilter(request, response);
    }
}
