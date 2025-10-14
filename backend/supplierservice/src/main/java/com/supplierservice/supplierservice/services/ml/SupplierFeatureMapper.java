package com.supplierservice.supplierservice.services.ml;

import com.supplierservice.supplierservice.models.ml.SupplierDailyFeatures;
import java.util.HashMap;
import java.util.Map;

public class SupplierFeatureMapper {

    public static Map<String, Object> toFeatureMap(Long supplierId, SupplierDailyFeatures f) {
        Map<String, Object> features = new HashMap<>();
        features.put("supplier_id", supplierId);
        Map<String, Object> inner = new HashMap<>();
        inner.put("otif30d", f.getOtif30d());
        inner.put("lateRate30d", f.getLateRate30d());
        inner.put("spend30d", f.getSpend30d());
        inner.put("openPoCount", f.getOpenPoCount());
        inner.put("medianLeadTime90d", f.getMedianLeadTime90d());
        inner.put("leadTimeIqr90d", f.getLeadTimeIqr90d());
        inner.put("defectRate180d", f.getDefectRate180d());
        inner.put("disputeRate180d", f.getDisputeRate180d());
        inner.put("priceIndex30d", f.getPriceIndex30d());
        features.put("features", inner);
        return features;
    }
}
