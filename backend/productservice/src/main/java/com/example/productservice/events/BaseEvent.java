package com.example.productservice.events;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent {
    @JsonProperty("eventId")
    private String eventId = UUID.randomUUID().toString();
    
    @JsonProperty("eventType")
    private String eventType;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @JsonProperty("version")
    private String version = "1.0";
    
    @JsonProperty("source")
    private String source;
    
    public BaseEvent(String eventType, String source) {
        this.eventType = eventType;
        this.source = source;
        this.timestamp = LocalDateTime.now();
        this.eventId = UUID.randomUUID().toString();
        this.version = "1.0";
    }
}
