package com.InventoryMangementSystem.inventoryservice.controller;

import com.InventoryMangementSystem.inventoryservice.dto.BarcodeDTO;
import com.InventoryMangementSystem.inventoryservice.models.Barcode;
import com.InventoryMangementSystem.inventoryservice.services.BarcodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/barcode")
public class BarcodeController {
    private final BarcodeService barcodeService;
    public BarcodeController (BarcodeService barcodeService ){
        this.barcodeService=barcodeService;
    }

    @PostMapping("/ItemId")
    public ResponseEntity<Barcode> addBarcode(@PathVariable Long  itemId , @RequestBody BarcodeDTO barcodeDTO){
        Barcode created=barcodeService.addBarcode(barcodeDTO);
        return ResponseEntity.ok(created);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Barcode> getBarcodeById(@PathVariable Long id) {
        Barcode barcode = barcodeService.getBarcodeById(id);
        return ResponseEntity.ok(barcode);
    }








}
