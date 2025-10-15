package com.supplierservice.supplierservice.controllers;

import com.supplierservice.supplierservice.dto.PurchaseOrderItemDTO;
import com.supplierservice.supplierservice.dto.QuantityUpdateDTO;
import com.supplierservice.supplierservice.services.PurchaseOrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000", "https://*.vercel.app",
        "https://*.choreoapis.dev" }, allowCredentials = "true")
@RequestMapping("/api/purchase-orders/{poId}/items")
public class PurchaseOrderItemController {

    private final PurchaseOrderItemService itemService;

    public PurchaseOrderItemController(PurchaseOrderItemService itemService) {
        this.itemService = itemService;
    }

    // GET /api/purchase-orders/{poId}/items
    @GetMapping
    public ResponseEntity<List<PurchaseOrderItemDTO>> list(@PathVariable Long poId) {
        return ResponseEntity.ok(itemService.listItems(poId));
    }

    // POST /api/purchase-orders/{poId}/items (accept single or array)
    @PostMapping
    public ResponseEntity<List<PurchaseOrderItemDTO>> add(
            @PathVariable Long poId,
            @RequestBody List<PurchaseOrderItemDTO> items) {
        return ResponseEntity.ok(itemService.addItems(poId, items));
    }

    // PUT /api/purchase-orders/{poId}/items/{itemId}
    @PutMapping("/{itemId}")
    public ResponseEntity<PurchaseOrderItemDTO> update(
            @PathVariable Long poId,
            @PathVariable Long itemId,
            @RequestBody PurchaseOrderItemDTO dto) {
        return ResponseEntity.ok(itemService.updateItem(poId, itemId, dto));
    }

    // DELETE /api/purchase-orders/{poId}/items/{itemId}
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long poId,
            @PathVariable Long itemId) {
        itemService.deleteItem(poId, itemId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/purchase-orders/{poId}/items/{itemId}/quantity
    @PatchMapping("/{itemId}/quantity")
    public ResponseEntity<PurchaseOrderItemDTO> patchQuantity(
            @PathVariable Long poId,
            @PathVariable Long itemId,
            @RequestBody QuantityUpdateDTO patch) {
        return ResponseEntity.ok(itemService.patchQuantity(poId, itemId, patch));
    }
}
