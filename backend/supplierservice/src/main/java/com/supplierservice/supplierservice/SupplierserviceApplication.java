package com.supplierservice.supplierservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableDiscoveryClient
public class SupplierserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupplierserviceApplication.class, args);
        System.out.println("Supplier Service is running...");
        System.out.println("Access the API at: http://localhost:8082/api/suppliers");
    }

}
