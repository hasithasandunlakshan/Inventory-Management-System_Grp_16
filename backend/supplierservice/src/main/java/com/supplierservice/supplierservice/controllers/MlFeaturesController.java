package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.MlPoFeaturesDTO;
import com.supplierservice.supplierservice.services.ml.MlFeatureBuilderService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/suppliers/{supplierId}")
public class MlFeaturesController {

    private final MlFeatureBuilderService featureBuilderService;

    public MlFeaturesController(MlFeatureBuilderService featureBuilderService) {
        this.featureBuilderService = featureBuilderService;
    }

    // GET /api/suppliers/{supplierId}/ml-features?order_date=YYYY-MM-DD
    // Returns a JSON payload with fields expected by the Render model.
    @GetMapping("/ml-features")
    public ResponseEntity<MlPoFeaturesDTO> getSupplierMlFeatures(
            @PathVariable Long supplierId,
            @RequestParam(value = "order_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate orderDate) {
        MlPoFeaturesDTO dto = featureBuilderService.buildSupplierFeatures(supplierId, orderDate);
        return ResponseEntity.ok(dto);
    }
}
