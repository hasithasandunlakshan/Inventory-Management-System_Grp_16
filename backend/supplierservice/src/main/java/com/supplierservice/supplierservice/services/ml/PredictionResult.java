package com.supplierservice.supplierservice.services.ml;

import lombok.Data;
import java.util.Map;

@Data
public class PredictionResult {
    private double probability;
    private int label;
    private Map<String, Object> featuresUsed;
}
