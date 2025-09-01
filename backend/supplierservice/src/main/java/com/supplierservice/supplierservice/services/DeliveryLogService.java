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
        // Add debugging
        System.out.println("Received DTO: poId=" + dto.getPoId() + ", itemID=" + dto.getItemID() +
                ", receivedQuantity=" + dto.getReceivedQuantity() + ", receivedDate=" + dto.getReceivedDate());

        if (dto.getPoId() == null) {
            throw new IllegalArgumentException("Purchase Order ID cannot be null");
        }

        try {
            System.out.println("Looking for Purchase Order with ID: " + dto.getPoId());
            PurchaseOrder order = purchaseOrderRepository.findById(dto.getPoId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Purchase order not found with ID: " + dto.getPoId()));

            System.out.println("Found Purchase Order: " + order.getPoId());

            DeliveryLog log = DeliveryLog.builder()
                    .purchaseOrder(order)
                    .itemId(dto.getItemID())
                    .receivedQuantity(dto.getReceivedQuantity())
                    .receivedDate(dto.getReceivedDate())
                    .build();

            System.out.println("Saving DeliveryLog...");
            DeliveryLog savedLog = deliveryLogRepository.save(log);
            System.out.println("DeliveryLog saved with ID: " + savedLog.getId());

            return savedLog;
        } catch (Exception e) {
            System.err.println("Error in logDelivery: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to log delivery: " + e.getMessage(), e);
        }
    }

    public List<DeliveryLog> getDeliveryLogsByPoId(Long poId) {
        return deliveryLogRepository.findAllByPoId(poId);
    }

    public List<DeliveryLog> getRecentDeliveryLogs() {
        return deliveryLogRepository.findTop10ByOrderByReceivedDateDesc();
    }

}
