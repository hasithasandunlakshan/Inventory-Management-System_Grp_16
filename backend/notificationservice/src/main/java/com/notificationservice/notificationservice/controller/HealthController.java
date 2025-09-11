package com.notificationservice.notificationservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "service", "Notification Service",
            "timestamp", LocalDateTime.now(),
            "version", "1.0.0",
            "features", Map.of(
                "websocket", "enabled",
                "kafka", "enabled",
                "database", "enabled"
            )
        );
    }
    
    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
            "message", "Notification Service is running",
            "websocket_test", "/websocket-test.html",
            "health", "/api/health"
        );
    }
}
