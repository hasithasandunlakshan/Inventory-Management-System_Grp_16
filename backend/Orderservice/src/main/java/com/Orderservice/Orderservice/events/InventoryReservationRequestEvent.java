package com.Orderservice.Orderservice.events;

import java.util.List;

import com.Orderservice.Orderservice.events.dto.InventoryReservationItem;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class InventoryReservationRequestEvent extends BaseEvent {
    
    @JsonProperty("orderId")
    private Long orderId;
    
    @JsonProperty("customerId")
    private Long customerId;
    
    @JsonProperty("items")
    private List<InventoryReservationItem> items;
    
    public InventoryReservationRequestEvent(Long orderId, Long customerId, List<InventoryReservationItem> items) {
        super("INVENTORY_RESERVATION_REQUEST", "order-service");
        this.orderId = orderId;
        this.customerId = customerId;
        this.items = items;
    }
}
