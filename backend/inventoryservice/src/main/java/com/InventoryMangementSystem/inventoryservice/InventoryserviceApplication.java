package com.InventoryMangementSystem.inventoryservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InventoryserviceApplication {

	public static void main(String[] args) {
		System.out.println("Inventory Service is running");
		SpringApplication.run(InventoryserviceApplication.class, args);

	}

}
