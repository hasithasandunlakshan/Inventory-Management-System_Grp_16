package com.InventoryMangementSystem.inventoryservice.config;

import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import javax.sql.DataSource;

/**
 * Test configuration for integration tests
 * Provides mocked beans for external services
 */
@TestConfiguration
@EntityScan(basePackages = "com.InventoryMangementSystem.inventoryservice.models")
@EnableJpaRepositories(basePackages = "com.InventoryMangementSystem.inventoryservice.repository")
public class IntegrationTestConfig {

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

    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return Mockito.mock(KafkaTemplate.class);
    }

    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public ProducerFactory<String, Object> producerFactory() {
        return Mockito.mock(ProducerFactory.class);
    }

    // Add more mocks for external services as needed
}
