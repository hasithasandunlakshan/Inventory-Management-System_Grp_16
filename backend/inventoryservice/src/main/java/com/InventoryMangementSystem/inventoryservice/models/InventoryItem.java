package com.InventoryMangementSystem.inventoryservice.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder //
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    private String name;

    @Column(name = "category_id")
    private Long categoryId;

    private int quantity;

    @Column(name = "reorder_level")
    private int reorderLevel;
}
