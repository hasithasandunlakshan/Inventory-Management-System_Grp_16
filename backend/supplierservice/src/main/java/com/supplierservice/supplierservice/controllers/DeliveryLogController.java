package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.DeliveryLogDTO;
import com.supplierservice.supplierservice.dto.DeliveryLogResponse;
import com.supplierservice.supplierservice.models.DeliveryLog;
import com.supplierservice.supplierservice.services.DeliveryLogService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery-logs")
public class DeliveryLogController {

    private final DeliveryLogService deliveryLogService;

    public DeliveryLogController(DeliveryLogService deliveryLogService) {
        this.deliveryLogService = deliveryLogService;
    }

    @PostMapping("/log")
    public ResponseEntity<DeliveryLogResponse> logDelivery(@RequestBody DeliveryLogDTO dto) {
        try {
            System.out.println("Controller received: " + dto);

            DeliveryLog deliveryLog = deliveryLogService.logDelivery(dto);

            return ResponseEntity.ok(
                    DeliveryLogResponse.success(
                            "Delivery logged successfully for Purchase Order "
                                    + deliveryLog.getPurchaseOrder().getPoId(),
                            deliveryLog));
        } catch (Exception e) {
            System.err.println("Error logging delivery: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(DeliveryLogResponse.error(
                            "Failed to log delivery: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<DeliveryLog> getDeliveryLogs(@RequestParam Long purchaseOrderId) {
        return deliveryLogService.getDeliveryLogsByPoId(purchaseOrderId);
    }

    @GetMapping("/recent")
    public List<DeliveryLog> getRecentDeliveryLogs() {
        return deliveryLogService.getRecentDeliveryLogs();
    }

}
