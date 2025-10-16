package com.example.productservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

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
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
        RequestMethod.OPTIONS, RequestMethod.HEAD })
public final class ProductController {

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
     * Retrieves all products with categories with pagination support.
     * 
     * @param page    page number (0-based, default: 0)
     * @param size    page size (default: 20)
     * @param sortBy  sort field (default: "id")
     * @param sortDir sort direction (default: "asc")
     * @return paginated list of products with categories
     */
    @GetMapping
    public ResponseEntity<Page<ProductWithCategoryDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "20") final int size,
            @RequestParam(defaultValue = "id") final String sortBy,
            @RequestParam(defaultValue = "asc") final String sortDir) {

        // Create Sort object
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        // Create Pageable object
        Pageable pageable = PageRequest.of(page, size, sort);

        final Page<ProductWithCategoryDTO> products = service.getAllProductsWithCategories(pageable);

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found with ID: " + productId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
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
            final double totalInventoryCost = service.calculateTotalAvailableInventoryCost();
            final int totalProductsWithStock = service.getProductsWithAvailableStock();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Available inventory cost calculated successfully",
                    "totalAvailableInventoryCost", totalInventoryCost,
                    "totalProductsWithStock", totalProductsWithStock,
                    "currency", "USD",
                    "calculatedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
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
            final ProductWithCategoryDTO product = service.getProductByBarcode(barcode);

            if (product != null) {

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
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Product not found for barcode: " + barcode));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
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
            final Product restockedProduct = service.restockProduct(productId, quantity);

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found with ID: " + productId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Product not found for barcode: " + barcode));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }
}
