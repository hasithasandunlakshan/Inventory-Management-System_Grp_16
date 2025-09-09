package com.notificationservice.notificationservice.service;

import com.notificationservice.notificationservice.dto.NotificationDto;
import com.notificationservice.notificationservice.model.Notification;
import com.notificationservice.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class NotificationServiceTest {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Test
    public void testCreateAndStoreNotification() {
        // Given
        String userId = "testUser123";
        String message = "Test notification message";
        String type = "ORDER";
        String metadata = "{\"orderId\":\"ORDER-123\",\"amount\":99.99}";
        
        // When
        Notification savedNotification = notificationService.createAndSendNotification(userId, message, type, metadata);
        
        // Then
        assertNotNull(savedNotification.getId());
        assertEquals(userId, savedNotification.getUserId());
        assertEquals(message, savedNotification.getMessage());
        assertEquals(type, savedNotification.getType());
        assertEquals(metadata, savedNotification.getMetadata());
        assertFalse(savedNotification.getIsRead());
        assertNotNull(savedNotification.getCreatedAt());
        
        // Verify it's stored in database
        List<Notification> storedNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        assertEquals(1, storedNotifications.size());
        assertEquals(savedNotification.getId(), storedNotifications.get(0).getId());
    }
    
    @Test
    public void testGetNotificationHistory() {
        // Given
        String userId = "historyTestUser";
        notificationService.createAndSendNotification(userId, "Message 1", "ORDER", null);
        notificationService.createAndSendNotification(userId, "Message 2", "INVENTORY", null);
        notificationService.createAndSendNotification(userId, "Message 3", "ORDER", null);
        
        // When
        List<NotificationDto> allNotifications = notificationService.getUserNotifications(userId);
        List<NotificationDto> orderNotifications = notificationService.getNotificationsByType(userId, "ORDER");
        
        // Then
        assertEquals(3, allNotifications.size());
        assertEquals(2, orderNotifications.size());
        
        // Verify order (most recent first)
        assertEquals("Message 3", allNotifications.get(0).getMessage());
        assertEquals("Message 2", allNotifications.get(1).getMessage());
        assertEquals("Message 1", allNotifications.get(2).getMessage());
    }
    
    @Test
    public void testMarkAsRead() {
        // Given
        String userId = "readTestUser";
        Notification notification = notificationService.createAndSendNotification(userId, "Test message", "ORDER", null);
        
        // When
        notificationService.markAsRead(notification.getId());
        
        // Then
        List<NotificationDto> unreadNotifications = notificationService.getUnreadNotifications(userId);
        assertEquals(0, unreadNotifications.size());
        
        Long unreadCount = notificationService.getUnreadCount(userId);
        assertEquals(0, unreadCount);
    }
    
    @Test
    public void testNotificationStats() {
        // Given
        String userId = "statsTestUser";
        notificationService.createAndSendNotification(userId, "Order message 1", "ORDER", null);
        notificationService.createAndSendNotification(userId, "Order message 2", "ORDER", null);
        notificationService.createAndSendNotification(userId, "Inventory message", "INVENTORY", null);
        
        // Mark one as read
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        notificationService.markAsRead(notifications.get(0).getId());
        
        // When
        var stats = notificationService.getNotificationStats(userId);
        
        // Then
        assertEquals(3L, stats.get("totalNotifications"));
        assertEquals(2L, stats.get("unreadCount"));
        assertEquals(1L, stats.get("readCount"));
        assertNotNull(stats.get("typeBreakdown"));
        assertNotNull(stats.get("latestNotification"));
    }
}
