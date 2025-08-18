package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.PurchaseOrderDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        @Transactional
        public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO dto) {
                Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

                PurchaseOrder order = PurchaseOrder.builder()
                                .supplier(supplier)
                                .date(dto.getDate())
                                .status(toStatusOrDefault(dto.getStatus()))
                                .build();

                // build items
                if (dto.getItems() != null) {
                        List<PurchaseOrderItem> items = dto.getItems().stream()
                                        .map(itemDTO -> PurchaseOrderItem.builder()
                                                        .purchaseOrder(order)
                                                        .itemId(itemDTO.getItemId())
                                                        .quantity(itemDTO.getQuantity())
                                                        .unitPrice(itemDTO.getUnitPrice())
                                                        .build())
                                        .collect(Collectors.toList());
                        order.getItems().addAll(items);
                }

                PurchaseOrder saved = purchaseOrderRepository.save(order);
                return toDetailDTO(saved); // mapped while still in tx
        }

        @Transactional(readOnly = true)
        public List<PurchaseOrderSummaryDTO> getAllOrders() {
                List<PurchaseOrder> list = purchaseOrderRepository.findAll(); // supplier is fetched via @EntityGraph
                return list.stream().map(this::toSummaryDTO).toList();
        }

        @Transactional(readOnly = true)
        public PurchaseOrderDTO getOrderById(Long id) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));
                return toDetailDTO(po);
        }

        // ===== mapping =====

        private PurchaseOrderSummaryDTO toSummaryDTO(PurchaseOrder po) {
                double total = po.getItems() == null ? 0.0
                                : po.getItems().stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum();

                return PurchaseOrderSummaryDTO.builder()
                                .id(po.getPoId())
                                .poNumber(null) // add when you implement numbering
                                .supplierId(po.getSupplier().getSupplierId())
                                .supplierName(po.getSupplier().getName())
                                .date(po.getDate())
                                .status(po.getStatus().name())
                                .total(total)
                                .build();
        }

        private PurchaseOrderDTO toDetailDTO(PurchaseOrder po) {
                List<PurchaseOrderItemDTO> items = po.getItems() == null ? List.of()
                                : po.getItems().stream().map(i -> PurchaseOrderItemDTO.builder()
                                                .id(i.getId())
                                                .itemId(i.getItemId())
                                                .quantity(i.getQuantity())
                                                .unitPrice(i.getUnitPrice())
                                                .lineTotal(i.getQuantity() * i.getUnitPrice())
                                                .build()).toList();

                double subtotal = items.stream()
                                .mapToDouble(x -> x.getLineTotal() == null ? 0.0 : x.getLineTotal())
                                .sum();

                return PurchaseOrderDTO.builder()
                                .id(po.getPoId())
                                .supplierId(po.getSupplier().getSupplierId())
                                .supplierName(po.getSupplier().getName())
                                .date(po.getDate())
                                .status(po.getStatus().name())
                                .items(items)
                                .subtotal(subtotal)
                                .total(subtotal) // adjust later if you add tax/discount
                                .build();
        }

        private PurchaseOrderStatus toStatusOrDefault(String status) {
                if (status == null || status.isBlank())
                        return PurchaseOrderStatus.DRAFT;
                return PurchaseOrderStatus.valueOf(status.toUpperCase());
        }
}
