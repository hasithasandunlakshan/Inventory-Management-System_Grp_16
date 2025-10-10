package com.InventoryMangementSystem.userservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/internal/**").permitAll() // Allow internal API for service-to-service
                                                                         // communication
                        .requestMatchers("/api/secure/**").permitAll() // Allow secure endpoints to be handled by custom
                                                                       // filter
                        .requestMatchers("/api/admin/**").permitAll() // Allow admin endpoints (auth handled by API
                                                                      // Gateway)
                        .requestMatchers("/actuator/**").permitAll() // Allow actuator endpoints for health checks
                        .anyRequest().authenticated());
        return http.build();
    }
}
