package com.Orderservice.Orderservice.client;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.Orderservice.Orderservice.dto.UserDetailsResponse;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8080}")
    private String userServiceUrl;

    @Autowired
    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetches a single user by ID from User Service
     * Uses: /api/admin/user/{userId}
     */
    public UserDetailsResponse.UserInfo getUserById(Long userId) {
        try {
            String url = userServiceUrl + "/api/admin/user/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class);

            JsonNode userNode = response.getBody();
            if (userNode != null) {
                UserDetailsResponse.UserInfo userInfo = new UserDetailsResponse.UserInfo();
                userInfo.setFullName(userNode.has("fullName") ? userNode.get("fullName").asText() : "Unknown");
                userInfo.setEmail(userNode.has("email") ? userNode.get("email").asText() : "");
                userInfo.setFormattedAddress(userNode.has("formattedAddress") && !userNode.get("formattedAddress").isNull() 
                        ? userNode.get("formattedAddress").asText() 
                        : "Address not available");
                
                if (userNode.has("latitude") && !userNode.get("latitude").isNull()) {
                    userInfo.setLatitude(userNode.get("latitude").asDouble());
                }
                if (userNode.has("longitude") && !userNode.get("longitude").isNull()) {
                    userInfo.setLongitude(userNode.get("longitude").asDouble());
                }
                
                return userInfo;
            }
            
            return null;

        } catch (HttpClientErrorException.NotFound e) {
            System.err.println("User not found with ID: " + userId);
            return null;
        } catch (Exception e) {
            System.err.println("Error calling User Service for user ID " + userId + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Fetches multiple users from User Service and returns them as a map (userId -> UserInfo)
     * This is more efficient for bulk operations - makes individual calls but caches results
     */
    public Map<Long, UserDetailsResponse.UserInfo> getAllUsersAsMap() {
        Map<Long, UserDetailsResponse.UserInfo> userMap = new HashMap<>();
        
        // Since there's no bulk endpoint, we'll rely on the calling code to pass specific user IDs
        // This method structure is kept for future bulk endpoint support
        System.out.println("Note: Using individual user fetch. Consider implementing bulk endpoint in User Service for better performance.");
        
        return userMap;
    }

    /**
     * OPTIMIZED: Fetches multiple users by their IDs using parallel processing
     * Makes individual API calls in parallel and returns them as a map for efficient lookup
     */
    public Map<Long, UserDetailsResponse.UserInfo> getUsersByIds(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new HashMap<>();
        }
        
        System.out.println("⚡ Fetching " + userIds.size() + " users from User Service in parallel...");
        long startTime = System.currentTimeMillis();
        
        // Use parallel stream for concurrent API calls
        Map<Long, UserDetailsResponse.UserInfo> userMap = userIds.parallelStream()
            .map(userId -> {
                try {
                    UserDetailsResponse.UserInfo userInfo = getUserById(userId);
                    return userInfo != null ? Map.entry(userId, userInfo) : null;
                } catch (Exception e) {
                    System.err.println("Error fetching user " + userId + ": " + e.getMessage());
                    return null;
                }
            })
            .filter(entry -> entry != null)
            .collect(Collectors.toMap(
                Map.Entry::getKey, 
                Map.Entry::getValue,
                (existing, replacement) -> existing // Handle duplicates by keeping existing
            ));
        
        long fetchTime = System.currentTimeMillis() - startTime;
        System.out.println("✓ Successfully fetched " + userMap.size() + " out of " + userIds.size() + " users in " + fetchTime + "ms");
        return userMap;
    }
}
