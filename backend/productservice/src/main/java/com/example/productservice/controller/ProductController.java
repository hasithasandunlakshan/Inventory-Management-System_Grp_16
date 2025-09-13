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

/**
 * REST controller for product operations.
 */
@RestController
@RequestMapping("/api/products")
public final class ProductController {

    /**
     * HTTP status code for not found.
     */
    private static final int HTTP_NOT_FOUND = 404;

    /**
     * HTTP status code for internal server error.
     */
    private static final int HTTP_INTERNAL_ERROR = 500;

    /**
     * The product service.
     */
    private final ProductService service;

    /**
     * Constructor for ProductController.
     * 
     * @param service the product service
     */
    public ProductController(final ProductService service) {
        this.service = service;
    }

    /**
     * Creates a new product.
     * 
     * @param dto the product data transfer object
     * @return the created product
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody final ProductDTO dto) {
        final Product created = service.createProduct(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Retrieves all products with categories.
     * 
     * @return list of products with categories
     */
    @GetMapping
    public ResponseEntity<List<ProductWithCategoryDTO>> getAllProducts() {
        final List<ProductWithCategoryDTO> products = service.getAllProductsWithCategories();
        return ResponseEntity.ok(products);
    }

    /**
     * Retrieves a product by ID.
     * 
     * @param id the product ID
     * @return the product with category or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductWithCategoryDTO> getProductById(
            @PathVariable final Long id) {
        return service.getProductWithCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves products by category ID.
     * 
     * @param categoryId the category ID
     * @return list of products in the category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductWithCategoryDTO>> getProductsByCategory(@PathVariable final Long categoryId) {
        final List<ProductWithCategoryDTO> products = service.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    /**
     * Updates an existing product.
     * 
     * @param id  the product ID
     * @param dto the product data transfer object
     * @return the updated product or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable final Long id,
            @RequestBody final ProductDTO dto) {
        try {
            final Product updatedProduct = service.updateProduct(id, dto);
            System.out.println("Updated product: " + updatedProduct);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deletes a product by ID.
     * 
     * @param id the product ID
     * @return 204 No Content on success, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable final Long id) {
        try {
            System.out.println("Deleting product with ID: " + id);
            service.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reduce inventory by updating both physical_stock and reserved columns.
     * 
     * @param productId the product ID
     * @param quantity  the quantity to reduce
     * @return response with inventory reduction details
     */
    @PutMapping("/{productId}/reduce/{quantity}")
    public ResponseEntity<Map<String, Object>> reduceInventory(
            @PathVariable final Long productId,
            @PathVariable final int quantity) {
        try {
            System.out.println("=== REDUCING INVENTORY ENDPOINT HIT ===");
            System.out.println("Product ID: " + productId);
            System.out.println("Quantity to reduce: " + quantity);

            final Product updatedProduct = service.reduceInventory(productId, quantity);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Inventory reduced successfully",
                    "productId", productId,
                    "quantityReduced", quantity,
                    "newPhysicalStock", updatedProduct.getStock(),
                    "newReservedStock", updatedProduct.getReserved(),
                    "newAvailableStock", updatedProduct.getAvailableStock()));

        } catch (ProductNotFoundException e) {
            System.err.println("Product not found: " + e.getMessage());
            return ResponseEntity.status(HTTP_NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found with ID: " + productId));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid argument: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error reducing inventory: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HTTP_INTERNAL_ERROR).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Test endpoint for debugging.
     * 
     * @param id the test ID
     * @return test response
     */
    @GetMapping("/test/{id}")
    public ResponseEntity<Map<String, Object>> test(@PathVariable final Long id) {
        return ResponseEntity.ok(Map.of("success", true, "id", id,
                "message", "Test endpoint works"));
    }

    /**
     * Get total available inventory cost.
     * Calculates the sum of (price * available_stock) for all products.
     * 
     * @return response with inventory cost details
     */
    @GetMapping("/inventory/cost")
    public ResponseEntity<Map<String, Object>> getAvailableInventoryCost() {
        try {
            System.out.println("=== CALCULATING AVAILABLE INVENTORY COST ===");

            final double totalInventoryCost = service.calculateTotalAvailableInventoryCost();
            final int totalProductsWithStock = service.getProductsWithAvailableStock();

            System.out.println("Total Available Inventory Cost: $"
                    + totalInventoryCost);
            System.out.println("Products with available stock: "
                    + totalProductsWithStock);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Available inventory cost calculated successfully",
                    "totalAvailableInventoryCost", totalInventoryCost,
                    "totalProductsWithStock", totalProductsWithStock,
                    "currency", "USD",
                    "calculatedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            System.err.println("Error calculating inventory cost: "
                    + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HTTP_INTERNAL_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to calculate inventory cost: "
                            + e.getMessage()));
        }
    }

    /**
     * Get product by barcode for barcode scanning.
     * 
     * @param barcode the product barcode
     * @return product details or 404 if not found
     */
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Map<String, Object>> getProductByBarcode(
            @PathVariable final String barcode) {
        try {
            System.out.println("=== BARCODE SCANNED ===");
            System.out.println("Barcode: " + barcode);

            final ProductWithCategoryDTO product = service.getProductByBarcode(barcode);

            if (product != null) {
                System.out.println("Product found: " + product.getName());
                System.out.println("Current Stock: " + product.getStock());
                System.out.println("Available Stock: " + product.getAvailableStock());

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Product found successfully",
                        "product", Map.of(
                                "productId", product.getProductId(),
                                "name", product.getName(),
                                "description", product.getDescription(),
                                "imageUrl", product.getImageUrl(),
                                "price", product.getPrice(),
                                "currentStock", product.getStock(),
                                "reservedStock", product.getReserved(),
                                "availableStock", product.getAvailableStock(),
                                "barcode", product.getBarcode(),
                                "categoryName", product.getCategoryName())));
            } else {
                System.out.println("Product not found for barcode: " + barcode);
                return ResponseEntity.status(HTTP_NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Product not found for barcode: " + barcode));
            }

        } catch (Exception e) {
            System.err.println("Error scanning barcode: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HTTP_INTERNAL_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error scanning barcode: " + e.getMessage()));
        }
    }

    /**
     * Restock product by adding quantity to both physical_stock and
     * available_stock.
     * 
     * @param productId the product ID
     * @param quantity  the quantity to add
     * @return response with restock details
     */
    @PutMapping("/{productId}/restock/{quantity}")
    public ResponseEntity<Map<String, Object>> restockProduct(
            @PathVariable final Long productId,
            @PathVariable final int quantity) {
        try {
            System.out.println("=== RESTOCKING PRODUCT ===");
            System.out.println("Product ID: " + productId);
            System.out.println("Quantity to add: " + quantity);

            final Product restockedProduct = service.restockProduct(productId, quantity);

            System.out.println("Restock successful!");
            System.out.println("New Physical Stock: " + restockedProduct.getStock());
            System.out.println("New Available Stock: "
                    + restockedProduct.getAvailableStock());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Product restocked successfully",
                    "productId", productId,
                    "quantityAdded", quantity,
                    "newPhysicalStock", restockedProduct.getStock(),
                    "newReservedStock", restockedProduct.getReserved(),
                    "newAvailableStock", restockedProduct.getAvailableStock(),
                    "productName", restockedProduct.getName(),
                    "restockedAt", java.time.LocalDateTime.now().toString()));

        } catch (ProductNotFoundException e) {
            System.err.println("Product not found: " + e.getMessage());
            return ResponseEntity.status(HTTP_NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found with ID: " + productId));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid quantity: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error restocking product: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HTTP_INTERNAL_ERROR).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Restock product by barcode convenience method.
     * 
     * @param barcode  the product barcode
     * @param quantity the quantity to add
     * @return response with restock details
     */
    @PutMapping("/barcode/{barcode}/restock/{quantity}")
    public ResponseEntity<Map<String, Object>> restockProductByBarcode(
            @PathVariable final String barcode,
            @PathVariable final int quantity) {
        try {
            System.out.println("=== RESTOCKING BY BARCODE ===");
            System.out.println("Barcode: " + barcode);
            System.out.println("Quantity to add: " + quantity);

            final Product restockedProduct = service.restockProductByBarcode(barcode, quantity);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Product restocked successfully using barcode",
                    "barcode", barcode,
                    "productId", restockedProduct.getId(),
                    "productName", restockedProduct.getName(),
                    "quantityAdded", quantity,
                    "newPhysicalStock", restockedProduct.getStock(),
                    "newReservedStock", restockedProduct.getReserved(),
                    "newAvailableStock", restockedProduct.getAvailableStock(),
                    "restockedAt", java.time.LocalDateTime.now().toString()));

        } catch (ProductNotFoundException e) {
            System.err.println("Product not found: " + e.getMessage());
            return ResponseEntity.status(HTTP_NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found for barcode: " + barcode));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid quantity: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error restocking product: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HTTP_INTERNAL_ERROR).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }
}
