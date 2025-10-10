package com.notificationservice.notificationservice.controller;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public String health() {
        return "{\"status\":\"UP\",\"service\":\"Notification Service\",\"timestamp\":\"" + 
               LocalDateTime.now() + "\",\"version\":\"1.0.0\"}";
    }
    
    @GetMapping("/")
    public String root() {
        return "{\"message\":\"Notification Service is running\"," +
               "\"websocket_test\":\"/websocket-test.html\"," +
               "\"health\":\"/api/health\"}";
    }
}
