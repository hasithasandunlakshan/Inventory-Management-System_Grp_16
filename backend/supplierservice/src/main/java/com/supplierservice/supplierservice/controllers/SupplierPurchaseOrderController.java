package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.dto.SupplierSpendDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers/{supplierId}")
public class SupplierPurchaseOrderController {

    private final PurchaseOrderService orderService;

    public SupplierPurchaseOrderController(PurchaseOrderService orderService) {
        this.orderService = orderService;
    }

    // GET /api/suppliers/{supplierId}/purchase-orders
    @GetMapping("/purchase-orders")
    public ResponseEntity<Page<PurchaseOrderSummaryDTO>> listSupplierPOs(
            @PathVariable Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
                orderService.listBySupplier(supplierId, page, size, sort, dateFrom, dateTo, status));
    }

    // GET /api/suppliers/{supplierId}/purchase-orders/open
    @GetMapping("/purchase-orders/open")
    public ResponseEntity<List<PurchaseOrderSummaryDTO>> listOpenSupplierPOs(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(orderService.listOpenBySupplier(supplierId));
    }

    // GET /api/suppliers/{supplierId}/spend?from=YYYY-MM-DD&to=YYYY-MM-DD
    @GetMapping("/spend")
    public ResponseEntity<SupplierSpendDTO> supplierSpend(
            @PathVariable Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(orderService.supplierSpend(supplierId, from, to));
    }
}
