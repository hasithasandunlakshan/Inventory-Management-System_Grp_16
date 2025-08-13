package com.suppplierservice.supplierservice.services;

import com.suppplierservice.supplierservice.dto.DeliveryLogDTO;
import com.suppplierservice.supplierservice.models.DeliveryLog;
import com.suppplierservice.supplierservice.models.PurchaseOrder;
import com.suppplierservice.supplierservice.repository.DeliveryLogRepository;
import com.suppplierservice.supplierservice.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

@Service
public class DeliveryLogService {

    private final DeliveryLogRepository deliveryLogRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public DeliveryLogService(DeliveryLogRepository deliveryLogRepository, PurchaseOrderRepository purchaseOrderRepository) {
        this.deliveryLogRepository = deliveryLogRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public DeliveryLog logDelivery(DeliveryLogDTO dto) {
        PurchaseOrder order = purchaseOrderRepository.findById(dto.getPoId())
                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));

        DeliveryLog log = DeliveryLog.builder()
                .purchaseOrder(order)
                .receivedQuantity(dto.getReceivedQuantity())
                .receivedDate(dto.getReceivedDate())
                .build();

        return deliveryLogRepository.save(log);
    }
}
