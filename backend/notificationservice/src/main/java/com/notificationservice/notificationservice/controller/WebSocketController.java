package com.notificationservice.notificationservice.controller;

import com.notificationservice.notificationservice.dto.NotificationDto;
import com.notificationservice.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class WebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Handle user subscription to notifications
     * This method is called when a user sends a message to /app/subscribe
     */
    @MessageMapping("/subscribe")
    @SendToUser("/queue/notifications")
    public NotificationDto subscribeToNotifications(
            @Payload Map<String, String> request,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal) {
        
        String userId = request.get("userId");
        logger.info("User {} subscribed to notifications", userId);
        
        // Store user session information
        headerAccessor.getSessionAttributes().put("userId", userId);
        
        // Send a welcome notification
        NotificationDto welcomeNotification = new NotificationDto();
        welcomeNotification.setUserId(userId);
        welcomeNotification.setMessage("Connected to notification service");
        welcomeNotification.setType("SYSTEM");
        welcomeNotification.setCreatedAt(java.time.LocalDateTime.now().toString());
        welcomeNotification.setIsRead(false);
        
        return welcomeNotification;
    }
    
    /**
     * Handle user requests for notification history
     */
    @MessageMapping("/history")
    @SendToUser("/queue/history")
    public Map<String, Object> getNotificationHistory(
            @Payload Map<String, String> request,
            SimpMessageHeaderAccessor headerAccessor) {
        
        String userId = request.get("userId");
        logger.info("User {} requested notification history", userId);
        
        try {
            var notifications = notificationService.getUserNotifications(userId);
            var unreadCount = notificationService.getUnreadCount(userId);
            
            return Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount,
                "status", "success"
            );
        } catch (Exception e) {
            logger.error("Error fetching notification history for user {}: {}", userId, e.getMessage());
            return Map.of(
                "status", "error",
                "message", "Failed to fetch notification history"
            );
        }
    }
    
    /**
     * Handle marking notifications as read via WebSocket
     */
    @MessageMapping("/mark-read")
    @SendToUser("/queue/response")
    public Map<String, String> markNotificationAsRead(
            @Payload Map<String, Object> request) {
        
        try {
            Long notificationId = Long.valueOf(request.get("notificationId").toString());
            notificationService.markAsRead(notificationId);
            
            logger.info("Notification {} marked as read", notificationId);
            
            return Map.of(
                "status", "success",
                "message", "Notification marked as read"
            );
        } catch (Exception e) {
            logger.error("Error marking notification as read: {}", e.getMessage());
            return Map.of(
                "status", "error",
                "message", "Failed to mark notification as read"
            );
        }
    }
    
    /**
     * Handle marking all notifications as read for a user
     */
    @MessageMapping("/mark-all-read")
    @SendToUser("/queue/response")
    public Map<String, String> markAllNotificationsAsRead(
            @Payload Map<String, String> request) {
        
        try {
            String userId = request.get("userId");
            notificationService.markAllAsRead(userId);
            
            logger.info("All notifications marked as read for user {}", userId);
            
            return Map.of(
                "status", "success",
                "message", "All notifications marked as read"
            );
        } catch (Exception e) {
            logger.error("Error marking all notifications as read: {}", e.getMessage());
            return Map.of(
                "status", "error",
                "message", "Failed to mark all notifications as read"
            );
        }
    }
    
    /**
     * Handle ping/pong for connection testing
     */
    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public Map<String, String> handlePing(@Payload Map<String, String> request) {
        return Map.of(
            "message", "pong",
            "timestamp", java.time.LocalDateTime.now().toString()
        );
    }
}
