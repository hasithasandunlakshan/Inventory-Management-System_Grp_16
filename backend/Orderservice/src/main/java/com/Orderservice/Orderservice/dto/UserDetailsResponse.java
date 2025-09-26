package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsResponse {
    private boolean success;
    private String message;
    private UserInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String phoneNumber;
        private String dateOfBirth;
        private String profileImageUrl;
        private Double latitude;
        private Double longitude;
        private String formattedAddress;
    }
}
