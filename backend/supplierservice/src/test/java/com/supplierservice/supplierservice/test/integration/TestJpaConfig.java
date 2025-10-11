package com.supplierservice.supplierservice.test.integration;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EntityScan(basePackages = { "com.supplierservice.supplierservice.test.integration" })
@EnableJpaRepositories(basePackages = { "com.supplierservice.supplierservice.test.integration" })
@ComponentScan(basePackages = { "com.supplierservice.supplierservice.test.integration" })
public class TestJpaConfig {
    // Configuration class to enable scanning of our test packages
}
