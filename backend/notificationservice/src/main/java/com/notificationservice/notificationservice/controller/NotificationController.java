package com.notificationservice.notificationservice.controller;

import com.notificationservice.notificationservice.dto.NotificationDto;
import com.notificationservice.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*") // Configure properly for production
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable String userId) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notifications for a user
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@PathVariable String userId) {
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
    
    /**
     * Mark a specific notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
    
    /**
     * Send a test notification (for testing purposes)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestNotification(
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        String message = request.get("message");
        String type = request.getOrDefault("type", "TEST");
        
        if (userId == null || message == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId and message are required"));
        }
        
        notificationService.createAndSendNotification(userId, message, type, null);
        return ResponseEntity.ok(Map.of("message", "Test notification sent successfully"));
    }
    
    /**
     * Send broadcast notification (for testing purposes)
     */
    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, String>> sendBroadcastNotification(
            @RequestBody Map<String, String> request) {
        
        String message = request.get("message");
        String type = request.getOrDefault("type", "BROADCAST");
        
        if (message == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "message is required"));
        }
        
        notificationService.sendBroadcastNotification(message, type);
        return ResponseEntity.ok(Map.of("message", "Broadcast notification sent successfully"));
    }
    
    /**
     * Simple WebSocket test endpoint
     */
    @PostMapping("/websocket-test")
    public ResponseEntity<Map<String, String>> testWebSocket(
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        String message = request.get("message");
        
        if (userId == null || message == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId and message are required"));
        }
        
        try {
            // Send both ways for testing
            notificationService.createAndSendNotification(userId, message, "WEBSOCKET_TEST", null);
            notificationService.sendBroadcastNotification("Broadcast: " + message, "WEBSOCKET_TEST");
            
            return ResponseEntity.ok(Map.of("message", "WebSocket test messages sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to send WebSocket message: " + e.getMessage()));
        }
    }
    
    /**
     * Get notifications by type for a user
     */
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByType(
            @PathVariable String userId, 
            @PathVariable String type) {
        List<NotificationDto> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get paginated notifications for a user
     */
    @GetMapping("/user/{userId}/paginated")
    public ResponseEntity<List<NotificationDto>> getPaginatedNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<NotificationDto> notifications = notificationService.getUserNotificationsPaginated(userId, page, size);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get notification statistics for a user
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats(@PathVariable String userId) {
        Map<String, Object> stats = notificationService.getNotificationStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Delete old notifications (admin endpoint)
     */
    @DeleteMapping("/cleanup/{daysOld}")
    public ResponseEntity<Map<String, String>> cleanupOldNotifications(@PathVariable int daysOld) {
        notificationService.deleteOldNotifications(daysOld);
        return ResponseEntity.ok(Map.of("message", String.format("Cleanup initiated for notifications older than %d days", daysOld)));
    }
}
