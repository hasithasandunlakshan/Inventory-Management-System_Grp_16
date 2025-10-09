package com.notificationservice.notificationservice.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSocket
public class ReactNativeWebSocketConfig implements WebSocketConfigurer {
    
    private static final Logger logger = LoggerFactory.getLogger(ReactNativeWebSocketConfig.class);
    private final ReactNativeWebSocketHandler webSocketHandler = new ReactNativeWebSocketHandler();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/rn-notifications")
                .setAllowedOrigins("*"); // In production, specify exact origins
    }
    
    @Bean
    public ReactNativeWebSocketHandler reactNativeWebSocketHandler() {
        return webSocketHandler;
    }

    public static class ReactNativeWebSocketHandler implements WebSocketHandler {
        
        private static final Logger logger = LoggerFactory.getLogger(ReactNativeWebSocketHandler.class);
        private final ObjectMapper objectMapper = new ObjectMapper();
        private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            logger.info("React Native WebSocket connection established: {}", session.getId());
            sessions.put(session.getId(), session);
            
            // Send welcome message
            Map<String, Object> welcomeMessage = Map.of(
                "type", "connection",
                "message", "Connected to notification service",
                "sessionId", session.getId(),
                "timestamp", System.currentTimeMillis()
            );
            
            sendMessage(session, welcomeMessage);
        }

        @Override
        public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
            logger.info("Received message from React Native client {}: {}", session.getId(), message.getPayload());
            
            try {
                String payload = message.getPayload().toString();
                Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
                
                String type = (String) messageData.get("type");
                
                switch (type != null ? type : "") {
                    case "subscribe":
                        handleSubscribe(session, messageData);
                        break;
                    case "ping":
                        handlePing(session);
                        break;
                    case "markRead":
                        handleMarkRead(session, messageData);
                        break;
                    default:
                        logger.warn("Unknown message type: {}", type);
                        sendError(session, "Unknown message type: " + type);
                }
            } catch (Exception e) {
                logger.error("Error handling message: ", e);
                sendError(session, "Error processing message: " + e.getMessage());
            }
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
            logger.error("WebSocket transport error for session {}: ", session.getId(), exception);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
            logger.info("React Native WebSocket connection closed: {} with status: {}", session.getId(), closeStatus);
            sessions.remove(session.getId());
        }

        @Override
        public boolean supportsPartialMessages() {
            return false;
        }
        
        private void handleSubscribe(WebSocketSession session, Map<String, Object> messageData) throws IOException {
            String userId = (String) messageData.get("userId");
            logger.info("User {} subscribed via React Native WebSocket", userId);
            
            // Store userId in session attributes
            session.getAttributes().put("userId", userId);
            
            Map<String, Object> response = Map.of(
                "type", "subscribed",
                "userId", userId,
                "message", "Successfully subscribed to notifications",
                "timestamp", System.currentTimeMillis()
            );
            
            sendMessage(session, response);
        }
        
        private void handlePing(WebSocketSession session) throws IOException {
            Map<String, Object> pong = Map.of(
                "type", "pong",
                "timestamp", System.currentTimeMillis()
            );
            
            sendMessage(session, pong);
        }
        
        private void handleMarkRead(WebSocketSession session, Map<String, Object> messageData) throws IOException {
            Long notificationId = Long.valueOf(messageData.get("notificationId").toString());
            logger.info("Marking notification {} as read via React Native WebSocket", notificationId);
            
            // Here you would call your notification service to mark as read
            // notificationService.markAsRead(notificationId);
            
            Map<String, Object> response = Map.of(
                "type", "marked_read",
                "notificationId", notificationId,
                "status", "success",
                "timestamp", System.currentTimeMillis()
            );
            
            sendMessage(session, response);
        }
        
        private void sendMessage(WebSocketSession session, Map<String, Object> message) throws IOException {
            if (session.isOpen()) {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            }
        }
        
        private void sendError(WebSocketSession session, String errorMessage) throws IOException {
            Map<String, Object> error = Map.of(
                "type", "error",
                "message", errorMessage,
                "timestamp", System.currentTimeMillis()
            );
            
            sendMessage(session, error);
        }
        
        // Method to broadcast notification to specific user
        public void sendNotificationToUser(String userId, Map<String, Object> notification) {
            sessions.values().stream()
                .filter(session -> userId.equals(session.getAttributes().get("userId")))
                .forEach(session -> {
                    try {
                        sendMessage(session, notification);
                    } catch (IOException e) {
                        logger.error("Error sending notification to user {}: ", userId, e);
                    }
                });
        }
        
        // Method to broadcast to all connected sessions
        public void broadcastNotification(Map<String, Object> notification) {
            sessions.values().forEach(session -> {
                try {
                    sendMessage(session, notification);
                } catch (IOException e) {
                    logger.error("Error broadcasting notification: ", e);
                }
            });
        }
    }
}