package com.supplierservice.supplierservice.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@TestConfiguration
@Profile("test")
@EnableAutoConfiguration
public class TestConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        // Create a basic H2 in-memory database
        // Let Spring Boot initialize it with schema.sql and data.sql
        return DataSourceBuilder.create()
                .url("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL")
                .username("sa")
                .password("")
                .driverClassName("org.h2.Driver")
                .build();
    }
}
