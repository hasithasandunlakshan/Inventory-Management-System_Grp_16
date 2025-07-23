package com.InventoryMangementSystem.inventoryservice.services;

import com.InventoryMangementSystem.inventoryservice.dto.StockLogDTO;
import com.InventoryMangementSystem.inventoryservice.models.StockLog;
import com.InventoryMangementSystem.inventoryservice.repository.StockLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockLogService {
    private final StockLogRepository stockLogRepository;

    public StockLogService(StockLogRepository stockLogRepository) {
        this.stockLogRepository = stockLogRepository;
    }

    public StockLog createStockLog(StockLogDTO stockLogDTO) {
        StockLog stockLog = StockLog.builder()
                .itemId(stockLogDTO.getItemId())
                .stockChange(stockLogDTO.getStockChange())
                .timestamp(LocalDateTime.now())
                .build();
        return stockLogRepository.save(stockLog);
    }

    public List<StockLog> getStockLogsByItemId(Long itemId) {
        return stockLogRepository.findByItemId(itemId);
    }

    public List<StockLog> getAllStockLogs() {
        return stockLogRepository.findAll();
    }
}