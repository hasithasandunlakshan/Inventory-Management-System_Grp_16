package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLogDTO {
    private Long poId; // Frontend sends this field name
    private Long itemID; // Item ID for the delivery (matches database item_id)
    private int receivedQuantity;
    private String receivedDate; // Frontend sends date as string (field name changed)

    // Helper method to convert string date to LocalDate
    public LocalDate getReceivedDate() {
        if (receivedDate != null && !receivedDate.isEmpty()) {
            return LocalDate.parse(receivedDate);
        }
        return LocalDate.now(); // Default to today if no date provided
    }

    // Helper method to get PO ID (for compatibility with service)
    public Long getPoId() {
        return poId;
    }
}
