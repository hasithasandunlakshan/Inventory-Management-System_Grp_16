package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderUpdateDTO;
import com.supplierservice.supplierservice.dto.CancelRequestDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.supplierservice.supplierservice.dto.StatusUpdateDTO;
import com.supplierservice.supplierservice.dto.ReceiveRequestDTO;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService orderService;

    public PurchaseOrderController(PurchaseOrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> createOrder(@RequestBody PurchaseOrderDTO dto) {
        return ResponseEntity.ok(orderService.createPurchaseOrder(dto));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderSummaryDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> updateOrder(
            @PathVariable Long id,
            @RequestBody PurchaseOrderUpdateDTO dto) {
        return ResponseEntity.ok(orderService.updatePurchaseOrder(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id,
            @RequestParam(name = "hard", defaultValue = "false") boolean hard,
            @RequestBody(required = false) CancelRequestDTO body) {
        String reason = (body != null) ? body.getReason() : null; // currently unused; reserved for audit
        orderService.deletePurchaseOrder(id, hard, reason);
        return ResponseEntity.noContent().build(); // 204
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderDTO> changeStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO body) {
        return ResponseEntity.ok(orderService.updateStatus(id, body));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderDTO> markReceived(
            @PathVariable Long id,
            @RequestBody(required = false) ReceiveRequestDTO body) {
        return ResponseEntity.ok(orderService.markReceived(id, body));
    }
}
