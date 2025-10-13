package com.Orderservice.Orderservice.client;

import com.Orderservice.Orderservice.dto.UserDetailsResponse;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

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
     * Fetches multiple users by their IDs
     * Makes individual API calls but returns them as a map for efficient lookup
     */
    public Map<Long, UserDetailsResponse.UserInfo> getUsersByIds(Set<Long> userIds) {
        Map<Long, UserDetailsResponse.UserInfo> userMap = new HashMap<>();
        
        System.out.println("Fetching " + userIds.size() + " users from User Service...");
        
        for (Long userId : userIds) {
            try {
                UserDetailsResponse.UserInfo userInfo = getUserById(userId);
                if (userInfo != null) {
                    userMap.put(userId, userInfo);
                }
            } catch (Exception e) {
                System.err.println("Error fetching user " + userId + ": " + e.getMessage());
            }
        }
        
        System.out.println("✓ Successfully fetched " + userMap.size() + " out of " + userIds.size() + " users");
        return userMap;
    }
}
