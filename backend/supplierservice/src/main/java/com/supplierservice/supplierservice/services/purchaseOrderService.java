package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.PurchaseOrderDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository itemRepository;
    private final SupplierRepository supplierRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                PurchaseOrderItemRepository itemRepository,
                                SupplierRepository supplierRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.itemRepository = itemRepository;
        this.supplierRepository = supplierRepository;
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrderDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        PurchaseOrder order = PurchaseOrder.builder()
                .supplier(supplier)
                .date(dto.getDate())
                .status(dto.getStatus())
                .build();

        order = purchaseOrderRepository.save(order);

        List<PurchaseOrderItem> items = dto.getItems().stream()
                .map(itemDTO -> PurchaseOrderItem.builder()
                        .purchaseOrder(order)
                        .itemId(itemDTO.getItemId())
                        .quantity(itemDTO.getQuantity())
                        .unitPrice(itemDTO.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        itemRepository.saveAll(items);

        order.setItems(items); // attach items to the order object
        return order;
    }

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }
}
