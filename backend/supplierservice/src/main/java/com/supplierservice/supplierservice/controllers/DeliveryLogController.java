package com.supplierservice.supplierservice.controller;

import com.supplierservice.supplierservice.dto.DeliveryLogDTO;
import com.supplierservice.supplierservice.models.DeliveryLog;
import com.supplierservice.supplierservice.services.DeliveryLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery-logs")
public class DeliveryLogController {

    private final DeliveryLogService deliveryLogService;

    public DeliveryLogController(DeliveryLogService deliveryLogService) {
        this.deliveryLogService = deliveryLogService;
    }

    @PostMapping
    public ResponseEntity<DeliveryLog> logDelivery(@RequestBody DeliveryLogDTO dto) {
        return ResponseEntity.ok(deliveryLogService.logDelivery(dto));
    }
}
