package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
