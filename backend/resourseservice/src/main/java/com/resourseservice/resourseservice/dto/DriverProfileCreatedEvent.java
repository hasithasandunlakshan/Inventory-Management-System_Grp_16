package com.resourseservice.resourseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileCreatedEvent {
    private String event;
    private Long userId;

    // Constructor for convenience
    public DriverProfileCreatedEvent(Long userId) {
        this.event = "DriverProfileCreated";
        this.userId = userId;
    }
}
