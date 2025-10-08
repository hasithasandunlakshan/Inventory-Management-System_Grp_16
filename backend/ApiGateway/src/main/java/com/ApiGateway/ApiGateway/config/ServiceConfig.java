package com.ApiGateway.ApiGateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "services")
public class ServiceConfig {
    
    private String userServiceUrl;
    private String productServiceUrl;
    private String orderServiceUrl;
    private String supplierServiceUrl;
    private String inventoryServiceUrl;
    private String resourceServiceUrl;
    private String healthServiceUrl;

    // Getters and Setters
    public String getUserServiceUrl() {
        return userServiceUrl != null ? userServiceUrl : "http://localhost:8080";
    }

    public void setUserServiceUrl(String userServiceUrl) {
        this.userServiceUrl = userServiceUrl;
    }

    public String getProductServiceUrl() {
        return productServiceUrl != null ? productServiceUrl : "http://localhost:8083";
    }

    public void setProductServiceUrl(String productServiceUrl) {
        this.productServiceUrl = productServiceUrl;
    }

    public String getOrderServiceUrl() {
        return orderServiceUrl != null ? orderServiceUrl : "http://localhost:8084";
    }

    public void setOrderServiceUrl(String orderServiceUrl) {
        this.orderServiceUrl = orderServiceUrl;
    }

    public String getSupplierServiceUrl() {
        return supplierServiceUrl != null ? supplierServiceUrl : "http://localhost:8082";
    }

    public void setSupplierServiceUrl(String supplierServiceUrl) {
        this.supplierServiceUrl = supplierServiceUrl;
    }

    public String getInventoryServiceUrl() {
        return inventoryServiceUrl != null ? inventoryServiceUrl : "http://localhost:8085";
    }

    public void setInventoryServiceUrl(String inventoryServiceUrl) {
        this.inventoryServiceUrl = inventoryServiceUrl;
    }

    public String getResourceServiceUrl() {
        return resourceServiceUrl != null ? resourceServiceUrl : "http://localhost:8086";
    }

    public void setResourceServiceUrl(String resourceServiceUrl) {
        this.resourceServiceUrl = resourceServiceUrl;
    }

    public String getHealthServiceUrl() {
        return healthServiceUrl != null ? healthServiceUrl : "http://localhost:8090";
    }

    public void setHealthServiceUrl(String healthServiceUrl) {
        this.healthServiceUrl = healthServiceUrl;
    }
}