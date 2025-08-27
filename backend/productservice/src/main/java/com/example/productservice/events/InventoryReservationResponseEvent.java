package com.example.productservice.events;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class InventoryReservationResponseEvent extends BaseEvent {
    
    @JsonProperty("orderId")
    private Long orderId;
    
    @JsonProperty("success")
    private boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("failedItems")
    private List<String> failedItems;
    
    public InventoryReservationResponseEvent(Long orderId, boolean success, String message, List<String> failedItems) {
        super("INVENTORY_RESERVATION_RESPONSE", "product-service");
        this.orderId = orderId;
        this.success = success;
        this.message = message;
        this.failedItems = failedItems;
    }
}
