package com.Orderservice.Orderservice.config;

import com.Orderservice.Orderservice.service.EventPublisherService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

/**
 * Test configuration for integration tests
 * Provides mocked beans for external services
 */
@TestConfiguration
@Profile("integration")
public class IntegrationTestConfig {

    @Bean
    @Primary
    public EventPublisherService eventPublisherService() {
        return Mockito.mock(EventPublisherService.class);
    }

    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> kafkaTemplate() {
        KafkaTemplate<String, Object> mock = Mockito.mock(KafkaTemplate.class);
        CompletableFuture<SendResult<String, Object>> future = CompletableFuture.completedFuture(null);
        Mockito.when(mock.send(Mockito.anyString(), Mockito.any())).thenReturn(future);
        return mock;
    }

    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public ProducerFactory<String, Object> producerFactory() {
        return Mockito.mock(ProducerFactory.class);
    }
}
