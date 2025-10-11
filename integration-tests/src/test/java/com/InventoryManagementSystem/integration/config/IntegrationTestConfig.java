package com.InventoryManagementSystem.integration.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@TestConfiguration
public class IntegrationTestConfig {

    @Bean
    @Primary
    public RestTemplate restTemplate() {
        return new RestTemplateBuilder().build();
    }

    @Bean
    @Primary
    public ConsumerFactory<String, String> consumerFactory(EmbeddedKafkaBroker embeddedKafkaBroker) {
        Map<String, Object> consumerProps = KafkaTestUtils
                .consumerProps("integration-test-consumer", "true", embeddedKafkaBroker);
        consumerProps.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        consumerProps.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        return new DefaultKafkaConsumerFactory<>(consumerProps);
    }

    @Bean
    @Primary
    public ProducerFactory<String, Object> producerFactory(EmbeddedKafkaBroker embeddedKafkaBroker) {
        Map<String, Object> producerProps = KafkaTestUtils.producerProps(embeddedKafkaBroker);
        producerProps.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        producerProps.put("value.serializer", "org.springframework.kafka.support.serializer.JsonSerializer");
        return new DefaultKafkaProducerFactory<>(producerProps);
    }

    @Bean
    @Primary
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }
}
