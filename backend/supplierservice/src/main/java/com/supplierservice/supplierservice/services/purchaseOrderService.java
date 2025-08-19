package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.PurchaseOrderDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderSummaryDTO;
import com.supplierservice.supplierservice.dto.PurchaseOrderUpdateDTO;
import com.supplierservice.supplierservice.models.*;
import com.supplierservice.supplierservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.supplierservice.supplierservice.dto.StatusUpdateDTO;
import com.supplierservice.supplierservice.dto.ReceiveRequestDTO;

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

        private void validateTransition(PurchaseOrderStatus from, PurchaseOrderStatus to) {
                if (from == to)
                        return;

                // Terminal states: cannot leave
                if (from == PurchaseOrderStatus.RECEIVED || from == PurchaseOrderStatus.CANCELLED) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Cannot change status from " + from + " (order is terminal)");
                }

                // Allowed path: DRAFT -> SENT -> PENDING -> RECEIVED
                // Cancel is allowed from any non-terminal state.
                switch (to) {
                        case DRAFT ->
                                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot revert back to DRAFT");
                        case SENT -> {
                                if (from != PurchaseOrderStatus.DRAFT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only DRAFT -> SENT is allowed");
                                }
                        }
                        case PENDING -> {
                                if (from != PurchaseOrderStatus.SENT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only SENT -> PENDING is allowed");
                                }
                        }
                        case RECEIVED -> {
                                if (from != PurchaseOrderStatus.PENDING && from != PurchaseOrderStatus.SENT) {
                                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                        "Only SENT/PENDING -> RECEIVED is allowed");
                                }
                        }
                        case CANCELLED -> {
                                // allowed from DRAFT/SENT/PENDING; already excluded terminal above
                        }
                        default -> throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                        "Unsupported status: " + to);
                }
        }

        @Transactional
        public PurchaseOrderDTO updateStatus(Long id, StatusUpdateDTO body) {
                if (body == null || body.getStatus() == null || body.getStatus().isBlank()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
                }

                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                PurchaseOrderStatus to = PurchaseOrderStatus.valueOf(body.getStatus().toUpperCase());
                PurchaseOrderStatus from = po.getStatus();

                validateTransition(from, to);

                po.setStatus(to);
                // TODO (optional): record reason, timestamps, audit trail
                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
        }

        @Transactional
        public PurchaseOrderDTO markReceived(Long id, ReceiveRequestDTO body) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // Treat as a specific transition to RECEIVED with its own rule:
                PurchaseOrderStatus from = po.getStatus();
                PurchaseOrderStatus to = PurchaseOrderStatus.RECEIVED;
                validateTransition(from, to);

                po.setStatus(PurchaseOrderStatus.RECEIVED);
                // If you later add fields like receivedAt/receivedBy, set them here using
                // 'body'
                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
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

        @Transactional
        public PurchaseOrderDTO updatePurchaseOrder(Long id, PurchaseOrderUpdateDTO req) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // unified rule
                ensureEditableStatus(po);

                if (req.getSupplierId() != null && !req.getSupplierId().equals(po.getSupplier().getSupplierId())) {
                        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                                        "Supplier not found"));
                        po.setSupplier(supplier);
                }
                if (req.getDate() != null) {
                        po.setDate(req.getDate());
                }

                PurchaseOrder saved = purchaseOrderRepository.save(po);
                return toDetailDTO(saved);
        }

        @Transactional
        public void deletePurchaseOrder(Long id, boolean hardDelete, String reason) {
                PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Purchase order not found"));

                // Business rules
                if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a RECEIVED order");
                }

                // Hard delete only allowed for DRAFT (policy)
                if (hardDelete && po.getStatus() == PurchaseOrderStatus.DRAFT) {
                        purchaseOrderRepository.delete(po);
                        return;
                }

                // Soft delete = cancel
                po.setStatus(PurchaseOrderStatus.CANCELLED);
                // (Optional) If you later add fields like cancelledAt/cancelReason, set them
                // here
                purchaseOrderRepository.save(po);
        }

        private void ensureEditableStatus(PurchaseOrder po) {
                switch (po.getStatus()) {
                        case DRAFT, SENT, PENDING -> {
                                /* OK */ }
                        case RECEIVED, CANCELLED -> throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Order header cannot be modified when status is " + po.getStatus());
                        default -> throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Order is not editable in current status: " + po.getStatus());
                }
        }

}
