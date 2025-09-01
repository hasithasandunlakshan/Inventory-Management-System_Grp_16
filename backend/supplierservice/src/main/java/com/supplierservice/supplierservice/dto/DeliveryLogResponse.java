package com.supplierservice.supplierservice.dto;

import com.supplierservice.supplierservice.models.DeliveryLog;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLogResponse {
    private boolean success;
    private String message;
    private DeliveryLog data;

    public static DeliveryLogResponse success(String message, DeliveryLog data) {
        return DeliveryLogResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static DeliveryLogResponse error(String message) {
        return DeliveryLogResponse.builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}
