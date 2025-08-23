package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.services.PurchaseOrderService;

import org.springframework.web.bind.annotation.*;

import com.supplierservice.supplierservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
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

    // GET /api/purchase-orders/search
    @GetMapping("/search")
    public ResponseEntity<Page<PurchaseOrderSummaryDTO>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Double minTotal,
            @RequestParam(required = false) Double maxTotal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity
                .ok(orderService.search(q, status, supplierId, dateFrom, dateTo, minTotal, maxTotal, page, size, sort));
    }

    // GET /api/purchase-orders/stats/summary
    @GetMapping("/stats/summary")
    public ResponseEntity<StatsSummaryDTO> statsSummary(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(orderService.kpiSummary(q, status, supplierId, dateFrom, dateTo));
    }

    // GET /api/purchase-orders/{id}/totals
    @GetMapping("/{id}/totals")
    public ResponseEntity<TotalsDTO> totals(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.computeTotals(id));
    }

    // GET /api/purchase-orders/export (CSV)
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        byte[] bytes = orderService.exportCsv(q, status, supplierId, dateFrom, dateTo);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=purchase_orders.csv");
        headers.set(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    // POST /api/purchase-orders/import (CSV multipart)
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportReportDTO> importCsv(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(orderService.importCsv(file));
    }

}
