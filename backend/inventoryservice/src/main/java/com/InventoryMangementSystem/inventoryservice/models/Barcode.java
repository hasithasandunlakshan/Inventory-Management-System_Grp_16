package com.InventoryMangementSystem.inventoryservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "barcodes")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Barcode {
    @Id
    @Column(name = "Item_id")
    private long itemid;

    private String barcode_value;
}
