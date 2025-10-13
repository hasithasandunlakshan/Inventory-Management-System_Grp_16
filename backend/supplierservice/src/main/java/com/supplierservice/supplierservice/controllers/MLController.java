package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.services.ml.MLServiceClient;
import com.supplierservice.supplierservice.services.ml.PredictionResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLServiceClient mlServiceClient;

    @PostMapping("/predict-po-risk")
    public ResponseEntity<PredictionResult> predictPoRisk(@RequestBody Map<String, Object> body) {
        PredictionResult result = mlServiceClient.predictPoRisk(body);
        return ResponseEntity.ok(result);
    }
}
