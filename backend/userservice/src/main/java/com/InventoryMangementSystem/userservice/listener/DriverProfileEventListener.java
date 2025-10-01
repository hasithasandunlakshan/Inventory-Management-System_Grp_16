package com.InventoryMangementSystem.userservice.listener;

import com.InventoryMangementSystem.userservice.dto.DriverProfileCreatedEvent;
import com.InventoryMangementSystem.userservice.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DriverProfileEventListener {

    private final AdminService adminService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "driver-profile-created-events", groupId = "userservice-group")
    public void handleDriverProfileCreated(String eventJson) {
        log.info("=== KAFKA CONSUMER TRIGGERED ===");
        log.info("Received raw event: {}", eventJson);

        try {
            // Deserialize into your DTO
            DriverProfileCreatedEvent event =
                    objectMapper.readValue(eventJson, DriverProfileCreatedEvent.class);

            Long userId = event.getUserId();
            log.info("Parsed userId: {}", userId);

            // Call service to update user role
            adminService.updateUserRole(userId, "Driver");
            log.info("✅ Successfully updated user ID {} role to DRIVER", userId);

        } catch (Exception e) {
            log.error("❌ Failed to process driver profile event: {}", e.getMessage(), e);
        }
    }
}
