package com.InventoryMangementSystem.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.InventoryMangementSystem")
@EntityScan("com.InventoryMangementSystem.userservice.entity")
@EnableJpaRepositories("com.InventoryMangementSystem.userservice.repository")
public class UserserviceApplication {
	public static void main(String[] args) {
		System.out.println("=== USER SERVICE APPLICATION STARTING ===");
		System.out.println("Timestamp: " + java.time.LocalDateTime.now());
		System.out.println("Component Scan Base Packages: com.InventoryMangementSystem");
		System.out.println("Entity Scan: com.InventoryMangementSystem.userservice.entity");
		System.out.println("JPA Repositories: com.InventoryMangementSystem.userservice.repository");
		
		SpringApplication.run(UserserviceApplication.class, args);
		
		System.out.println("=== USER SERVICE APPLICATION STARTED SUCCESSFULLY ===");
	}
}
