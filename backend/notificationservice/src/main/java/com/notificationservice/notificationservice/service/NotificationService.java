package com.notificationservice.notificationservice.service;

import com.notificationservice.notificationservice.dto.NotificationDto;
import com.notificationservice.notificationservice.model.Notification;
import com.notificationservice.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Create and send notification to a specific user
     */
    public Notification createAndSendNotification(String userId, String message, String type, String metadata) {
        try {
            logger.info("Creating notification for user {}: {}", userId, message);
            
            // Save notification to database
            Notification notification = new Notification(userId, message, type, metadata);
            Notification savedNotification = notificationRepository.save(notification);
            logger.info("Notification saved to database with ID: {}", savedNotification.getId());
            
            // Convert to DTO for WebSocket transmission
            NotificationDto notificationDto = convertToDto(savedNotification);
            logger.info("Converted to DTO: {}", notificationDto.getMessage());
            
            // Send notification via WebSocket to specific user
            messagingTemplate.convertAndSendToUser(
                userId, 
                "/queue/notifications", 
                notificationDto
            );
            logger.info("WebSocket message sent to user {} at destination /user/{}/queue/notifications", userId, userId);
            
            // Also try sending to topic for testing
            messagingTemplate.convertAndSend("/topic/notifications", notificationDto);
            logger.info("Also sent to broadcast topic for testing");
            
            logger.info("Notification sent to user {}: {}", userId, message);
            return savedNotification;
            
        } catch (Exception e) {
            logger.error("Error creating and sending notification to user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to send notification", e);
        }
    }
    
    /**
     * Send notification to all connected users (broadcast)
     */
    public void sendBroadcastNotification(String message, String type) {
        try {
            NotificationDto notificationDto = new NotificationDto();
            notificationDto.setMessage(message);
            notificationDto.setType(type);
            notificationDto.setCreatedAt(java.time.LocalDateTime.now().format(formatter));
            
            messagingTemplate.convertAndSend("/topic/notifications", notificationDto);
            logger.info("Broadcast notification sent: {}", message);
            
        } catch (Exception e) {
            logger.error("Error sending broadcast notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get all notifications for a user
     */
    public List<NotificationDto> getUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<NotificationDto> getUnreadNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }
    
    /**
     * Mark all user notifications as read
     */
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    /**
     * Get unread notification count for a user
     */
    public Long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Get notifications by type for a user
     */
    public List<NotificationDto> getNotificationsByType(String userId, String type) {
        List<Notification> notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get paginated notification history
     */
    public List<NotificationDto> getUserNotificationsPaginated(String userId, int page, int size) {
        // This would require adding Pageable support to repository
        List<Notification> allNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int start = page * size;
        int end = Math.min(start + size, allNotifications.size());
        
        if (start >= allNotifications.size()) {
            return Collections.emptyList();
        }
        
        return allNotifications.subList(start, end).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete old notifications (cleanup)
     */
    public void deleteOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        // This would require adding a delete method to repository
        logger.info("Cleanup method called for notifications older than {} days", daysOld);
    }
    
    /**
     * Get notification statistics for a user
     */
    public Map<String, Object> getNotificationStats(String userId) {
        List<Notification> allNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        Long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
        
        Map<String, Long> typeCount = allNotifications.stream()
                .collect(Collectors.groupingBy(Notification::getType, Collectors.counting()));
        
        return Map.of(
            "totalNotifications", (long) allNotifications.size(),
            "unreadCount", unreadCount,
            "readCount", allNotifications.size() - unreadCount,
            "typeBreakdown", typeCount,
            "latestNotification", allNotifications.isEmpty() ? null : convertToDto(allNotifications.get(0))
        );
    }
    
    /**
     * Convert Notification entity to DTO
     */
    private NotificationDto convertToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setCreatedAt(notification.getCreatedAt().format(formatter));
        dto.setIsRead(notification.getIsRead());
        dto.setMetadata(notification.getMetadata());
        return dto;
    }
}
