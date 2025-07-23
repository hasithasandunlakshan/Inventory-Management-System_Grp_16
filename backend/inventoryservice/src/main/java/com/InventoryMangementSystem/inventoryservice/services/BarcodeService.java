package com.InventoryMangementSystem.inventoryservice.services;

import com.InventoryMangementSystem.inventoryservice.dto.BarcodeDTO;
import com.InventoryMangementSystem.inventoryservice.models.Barcode;
import com.InventoryMangementSystem.inventoryservice.repository.BarcodeRepository;
import org.springframework.stereotype.Service;

@Service
public class BarcodeService {
    private final BarcodeRepository barcodeRepository;

    public BarcodeService(BarcodeRepository barcodeRepository){
        this.barcodeRepository=barcodeRepository;
    }

    public Barcode addBarcode (BarcodeDTO barcodeDTO){
        Barcode barcode=Barcode.builder().
                barcode_value(barcodeDTO.getBarcodeValue()).
                itemid(barcodeDTO.getItemId())
                .build();
        return barcodeRepository.save(barcode);
    }

    public Barcode getBarcodeById(long id){
        return barcodeRepository.findById(id).orElseThrow(()->new RuntimeException("No items with this Barcode"));
    }

}
