package com.example.productservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.dto.ProductWithCategoryDTO;
import com.example.productservice.exception.ProductNotFoundException;
import com.example.productservice.models.Product;
import com.example.productservice.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductDTO dto) {
        Product created = service.createProduct(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ProductWithCategoryDTO>> getAllProducts() {
        List<ProductWithCategoryDTO> products = service.getAllProductsWithCategories();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductWithCategoryDTO> getProductById(@PathVariable Long id) {
        return service.getProductWithCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductWithCategoryDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductWithCategoryDTO> products = service.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    // Pruned endpoints: available listings and stock reduction to keep API surface minimal
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        try {
            Product updatedProduct = service.updateProduct(id, dto);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("Deleting product with ID: " + id);
            service.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reduce inventory by updating both physical_stock and reserved columns PUT
     * /api/products/{productId}/reduce/{quantity}
     */
    @PutMapping("/{productId}/reduce/{quantity}")
    public ResponseEntity<Map<String, Object>> reduceInventory(
            @PathVariable Long productId,
            @PathVariable int quantity) {
        try {
            System.out.println("=== REDUCING INVENTORY ENDPOINT HIT ===");
            System.out.println("Product ID: " + productId);
            System.out.println("Quantity to reduce: " + quantity);

            Product updatedProduct = service.reduceInventory(productId, quantity);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Inventory reduced successfully",
                    "productId", productId,
                    "quantityReduced", quantity,
                    "newPhysicalStock", updatedProduct.getStock(),
                    "newReservedStock", updatedProduct.getReserved(),
                    "newAvailableStock", updatedProduct.getAvailableStock()
            ));

        } catch (ProductNotFoundException e) {
            System.err.println("Product not found: " + e.getMessage());
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Product not found with ID: " + productId
            ));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid argument: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Unexpected error reducing inventory: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/test/{id}")
    public ResponseEntity<Map<String, Object>> test(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "id", id, "message", "Test endpoint works"));
    }

    /**
     * Get total available inventory cost
     * Calculates the sum of (price * available_stock) for all products
     * GET /api/products/inventory/cost
     */
    @GetMapping("/inventory/cost")
    public ResponseEntity<Map<String, Object>> getAvailableInventoryCost() {
        try {
            System.out.println("=== CALCULATING AVAILABLE INVENTORY COST ===");
            
            double totalInventoryCost = service.calculateTotalAvailableInventoryCost();
            int totalProductsWithStock = service.getProductsWithAvailableStock();
            
            System.out.println("Total Available Inventory Cost: $" + totalInventoryCost);
            System.out.println("Products with available stock: " + totalProductsWithStock);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Available inventory cost calculated successfully",
                    "totalAvailableInventoryCost", totalInventoryCost,
                    "totalProductsWithStock", totalProductsWithStock,
                    "currency", "USD",
                    "calculatedAt", java.time.LocalDateTime.now().toString()
            ));
            
        } catch (Exception e) {
            System.err.println("Error calculating inventory cost: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to calculate inventory cost: " + e.getMessage()
            ));
        }
    }
}
