package com.InventoryMangementSystem.inventoryservice.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

/**
 * Test configuration for integration tests.
 * Provides beans required for testing without using actual external services.
 */
@TestConfiguration
@EntityScan(basePackages = "com.InventoryMangementSystem.inventoryservice.models")
@EnableJpaRepositories(basePackages = "com.InventoryMangementSystem.inventoryservice.repository")
public class TestConfig {

    /**
     * Creates an in-memory H2 database for testing
     */
    @Bean
    @Primary
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        return dataSource;
    }
}
