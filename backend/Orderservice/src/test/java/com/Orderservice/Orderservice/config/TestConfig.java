package com.Orderservice.Orderservice.config;

import com.Orderservice.Orderservice.service.EventPublisherService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@TestConfiguration
@Profile("test")
public class TestConfig {
    
    @Bean
    @Primary
    public EventPublisherService mockEventPublisherService() {
        return Mockito.mock(EventPublisherService.class);
    }
    
    @Bean
    @Primary
    @SuppressWarnings("unchecked")
    public KafkaTemplate<String, Object> mockKafkaTemplate() {
        return Mockito.mock(KafkaTemplate.class);
    }
    
    @Bean  
    @Primary
    @SuppressWarnings("unchecked")
    public ProducerFactory<String, Object> mockProducerFactory() {
        return Mockito.mock(ProducerFactory.class);
    }
}
