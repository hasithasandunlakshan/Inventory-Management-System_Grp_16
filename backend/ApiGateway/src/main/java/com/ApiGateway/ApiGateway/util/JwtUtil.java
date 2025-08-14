package com.ApiGateway.ApiGateway.util;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims extractAllClaims(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        System.out.println("[JwtUtil] Extracted Claims: " + claims);
        return claims;
    }

    public String extractUsername(String token) {
        String username = extractAllClaims(token).getSubject();
        System.out.println("[JwtUtil] Extracted Username: " + username);
        return username;
    }

    public String extractRole(String token) {
    Claims claims = extractAllClaims(token);
    String role = (String) claims.get("role");
    System.out.println("[JwtUtil] Extracted Role: " + role);
    return role;
}

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Long userId = Long.valueOf(claims.get("userId").toString());
        System.out.println("[JwtUtil] Extracted UserId: " + userId);
        return userId;
    }

    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        String email = (String) claims.get("email");
        System.out.println("[JwtUtil] Extracted Email: " + email);
        return email;
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
