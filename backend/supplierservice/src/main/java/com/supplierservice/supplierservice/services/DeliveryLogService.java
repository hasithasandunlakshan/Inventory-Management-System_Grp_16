package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.DeliveryLogDTO;
import com.supplierservice.supplierservice.models.DeliveryLog;
import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.repository.DeliveryLogRepository;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class DeliveryLogService {

    private final DeliveryLogRepository deliveryLogRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public DeliveryLogService(DeliveryLogRepository deliveryLogRepository,
            PurchaseOrderRepository purchaseOrderRepository) {
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

    public List<DeliveryLog> getDeliveryLogsByPoId(Long poId) {
        return deliveryLogRepository.findAllByPoId(poId);
    }

}
