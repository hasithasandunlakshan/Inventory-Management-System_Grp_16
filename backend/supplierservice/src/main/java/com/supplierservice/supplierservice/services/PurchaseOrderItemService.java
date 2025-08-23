package com.supplierservice.supplierservice.services;

import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.QuantityUpdateDTO;
import com.supplierservice.supplierservice.models.PurchaseOrder;
import com.supplierservice.supplierservice.models.PurchaseOrderItem;
import com.supplierservice.supplierservice.repository.PurchaseOrderItemRepository;
import com.supplierservice.supplierservice.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PurchaseOrderItemService {

    private final PurchaseOrderRepository poRepo;
    private final PurchaseOrderItemRepository itemRepo;

    public PurchaseOrderItemService(PurchaseOrderRepository poRepo,
            PurchaseOrderItemRepository itemRepo) {
        this.poRepo = poRepo;
        this.itemRepo = itemRepo;
    }

    private void ensureEditableStatus(PurchaseOrder po) {
        switch (po.getStatus()) {
            case DRAFT, SENT, PENDING -> {
                /* OK */ }
            case RECEIVED, CANCELLED -> throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Items cannot be modified when order status is " + po.getStatus());
            default -> throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Order is not editable in current status: " + po.getStatus());
        }
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderItemDTO> listItems(Long poId) {
        ensurePOExists(poId);
        return itemRepo.findByPurchaseOrder_PoId(poId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public List<PurchaseOrderItemDTO> addItems(Long poId, List<PurchaseOrderItemDTO> reqItems) {
        PurchaseOrder po = ensurePOExists(poId);
        ensureEditableStatus(po);
        List<PurchaseOrderItem> entities = reqItems.stream()
                .map(d -> PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .itemId(d.getItemId())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .build())
                .toList();

        List<PurchaseOrderItem> saved = itemRepo.saveAll(entities);
        return saved.stream().map(this::toDTO).toList();
    }

    @Transactional
    public PurchaseOrderItemDTO updateItem(Long poId, Long itemId, PurchaseOrderItemDTO dto) {
        PurchaseOrderItem entity = getAndEnsureOwnership(poId, itemId);
        ensureEditableStatus(entity.getPurchaseOrder());
        entity.setItemId(dto.getItemId());
        entity.setQuantity(dto.getQuantity());
        entity.setUnitPrice(dto.getUnitPrice());
        PurchaseOrderItem saved = itemRepo.save(entity);
        return toDTO(saved);
    }

    @Transactional
    public void deleteItem(Long poId, Long itemId) {
        PurchaseOrderItem entity = getAndEnsureOwnership(poId, itemId);
        ensureEditableStatus(entity.getPurchaseOrder());
        itemRepo.delete(entity);
    }

    @Transactional
    public PurchaseOrderItemDTO patchQuantity(Long poId, Long itemId, QuantityUpdateDTO patch) {
        PurchaseOrderItem entity = getAndEnsureOwnership(poId, itemId);
        ensureEditableStatus(entity.getPurchaseOrder());
        entity.setQuantity(patch.getQuantity());
        PurchaseOrderItem saved = itemRepo.save(entity);
        return toDTO(saved);
    }

    // ===== helpers =====

    private PurchaseOrder ensurePOExists(Long poId) {
        return poRepo.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found: " + poId));
    }

    private PurchaseOrderItem getAndEnsureOwnership(Long poId, Long itemId) {
        PurchaseOrderItem entity = itemRepo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("PO item not found: " + itemId));
        if (entity.getPurchaseOrder() == null || entity.getPurchaseOrder().getPoId() == null
                || !entity.getPurchaseOrder().getPoId().equals(poId)) {
            throw new IllegalArgumentException("Item does not belong to purchase order " + poId);
        }
        return entity;
    }

    private PurchaseOrderItemDTO toDTO(PurchaseOrderItem i) {
        double lineTotal = i.getQuantity() * i.getUnitPrice();
        return PurchaseOrderItemDTO.builder()
                .id(i.getId())
                .itemId(i.getItemId())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .lineTotal(lineTotal)
                .build();
    }
}
