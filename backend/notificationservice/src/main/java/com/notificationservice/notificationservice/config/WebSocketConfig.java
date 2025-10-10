package com.notificationservice.notificationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to carry the messages back to the client
        // on destinations prefixed with "/topic" and "/queue"
        config.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Designate the "/app" prefix for messages that are bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for personal notifications
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // In production, specify exact origins
                .withSockJS();
        
        // Alternative endpoint without SockJS
        registry.addEndpoint("/websocket")
                .setAllowedOriginPatterns("*");
                
        // React Native compatible endpoint - supports WebSocket upgrade from HTTP
        registry.addEndpoint("/notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setClientLibraryUrl("//cdn.jsdelivr.net/sockjs/1.0.0/sockjs.min.js");
                
        // Pure WebSocket endpoint without STOMP for React Native
        registry.addEndpoint("/native-ws")
                .setAllowedOriginPatterns("*");
    }
}
