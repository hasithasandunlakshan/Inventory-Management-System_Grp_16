package com.Orderservice.Orderservice.client;

import com.Orderservice.Orderservice.dto.UserDetailsResponse;
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

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8080}")
    private String userServiceUrl;

    @Autowired
    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserDetailsResponse.UserInfo getUserById(Long userId) {
        try {
            String url = userServiceUrl + "/api/internal/user/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<UserDetailsResponse.UserInfo> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    UserDetailsResponse.UserInfo.class);

            return response.getBody();

        } catch (HttpClientErrorException.NotFound e) {
            System.err.println("User not found with ID: " + userId);
            return null;
        } catch (Exception e) {
            System.err.println("Error calling User Service for user ID " + userId + ": " + e.getMessage());
            return null;
        }
    }
}
