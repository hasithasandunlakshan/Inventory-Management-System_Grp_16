package com.ApiGateway.ApiGateway.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ApiGateway.ApiGateway.config.ServiceConfig;

@RestController
@RequestMapping("/gateway")
public class HealthController {

    @Autowired
    private ServiceConfig serviceConfig;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> healthResponse = new HashMap<>();
        
        healthResponse.put("status", "UP");
        healthResponse.put("message", "API Gateway Service is running");
        healthResponse.put("service", "api-gateway");
        healthResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        healthResponse.put("version", "1.0.0");
        
        // Add service configuration info
        Map<String, String> services = new HashMap<>();
        services.put("userService", serviceConfig.getUserServiceUrl());
        services.put("productService", serviceConfig.getProductServiceUrl());
        services.put("orderService", serviceConfig.getOrderServiceUrl());
        services.put("supplierService", serviceConfig.getSupplierServiceUrl());
        services.put("inventoryService", serviceConfig.getInventoryServiceUrl());
        services.put("resourceService", serviceConfig.getResourceServiceUrl());
        
        healthResponse.put("connectedServices", services);
        
        return ResponseEntity.ok(healthResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> statusResponse = new HashMap<>();
        
        statusResponse.put("service", "API Gateway");
        statusResponse.put("status", "Service is running");
        statusResponse.put("uptime", "Online");
        statusResponse.put("environment", System.getProperty("spring.profiles.active", "default"));
        statusResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return ResponseEntity.ok(statusResponse);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        Map<String, Object> infoResponse = new HashMap<>();
        
        infoResponse.put("applicationName", "Inventory Management System - API Gateway");
        infoResponse.put("version", "1.0.0");
        infoResponse.put("description", "API Gateway for Inventory Management System microservices");
        infoResponse.put("status", "Service is running");
        infoResponse.put("developer", "Group 16");
        infoResponse.put("buildTime", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Add endpoints info
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("health", "/gateway/health");
        endpoints.put("status", "/gateway/status");
        endpoints.put("info", "/gateway/info");
        endpoints.put("actuatorHealth", "/actuator/health");
        
        infoResponse.put("availableEndpoints", endpoints);
        
        return ResponseEntity.ok(infoResponse);
    }
}