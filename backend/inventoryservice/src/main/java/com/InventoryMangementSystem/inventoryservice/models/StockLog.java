package com.InventoryMangementSystem.inventoryservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "stock_change")
    private Integer stockChange;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}