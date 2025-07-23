package com.InventoryMangementSystem.inventoryservice.controller;

import com.InventoryMangementSystem.inventoryservice.dto.StockLogDTO;
import com.InventoryMangementSystem.inventoryservice.models.StockLog;
import com.InventoryMangementSystem.inventoryservice.services.StockLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-logs")
public class StockLogController {
    private final StockLogService stockLogService;

    public StockLogController(StockLogService stockLogService) {
        this.stockLogService = stockLogService;
    }

    @PostMapping
    public ResponseEntity<StockLog> createStockLog(@RequestBody StockLogDTO stockLogDTO) {
        StockLog createdStockLog = stockLogService.createStockLog(stockLogDTO);
        return ResponseEntity.ok(createdStockLog);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<StockLog>> getStockLogsByItemId(@PathVariable Long itemId) {
        List<StockLog> stockLogs = stockLogService.getStockLogsByItemId(itemId);
        return ResponseEntity.ok(stockLogs);
    }

    @GetMapping
    public ResponseEntity<List<StockLog>> getAllStockLogs() {
        List<StockLog> stockLogs = stockLogService.getAllStockLogs();
        return ResponseEntity.ok(stockLogs);
    }
}