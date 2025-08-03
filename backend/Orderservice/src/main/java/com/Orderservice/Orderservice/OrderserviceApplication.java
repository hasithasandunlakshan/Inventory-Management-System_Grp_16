package com.Orderservice.Orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.Orderservice")
@EntityScan("com.Orderservice.Orderservice.entity")
@EnableJpaRepositories("com.Orderservice.Orderservice.repository")
public class OrderserviceApplication {

    public static void main(String[] args) {
        System.out.println("=== ORDER SERVICE APPLICATION STARTING ===");
        SpringApplication.run(OrderserviceApplication.class, args);
        System.out.println("=== ORDER SERVICE STARTED SUCCESSFULLY ===");
    }

}
