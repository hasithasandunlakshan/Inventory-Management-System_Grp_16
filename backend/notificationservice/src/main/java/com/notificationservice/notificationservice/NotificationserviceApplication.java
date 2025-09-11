package com.notificationservice.notificationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class NotificationserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificationserviceApplication.class, args);
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

}
