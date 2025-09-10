package com.example.productservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.dto.ProductWithCategoryDTO;
import com.example.productservice.exception.BarcodeGenerationException;
import com.example.productservice.exception.ProductNotFoundException;
import com.example.productservice.models.Category;
import com.example.productservice.models.Product;
import com.example.productservice.models.ProductCategory;
import com.example.productservice.repository.ProductCategoryRepository;
import com.example.productservice.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository repository;
    private final ProductCategoryRepository productCategoryRepository;
    private final BarcodeService barcodeService;
    private final CategoryService categoryService;

    @Autowired
    public ProductService(ProductRepository repository, 
                         ProductCategoryRepository productCategoryRepository,
                         BarcodeService barcodeService,
                         CategoryService categoryService) {
        this.repository = repository;
        this.productCategoryRepository = productCategoryRepository;
        this.barcodeService = barcodeService;
        this.categoryService = categoryService;
    }

    public String generateProductId(String productName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String cleanName = productName.toLowerCase().replaceAll("[^a-z0-9]", "").replaceAll("\\s+", "");

        return "PRD-" + timestamp + "-" + cleanName;
    }

    @Transactional
    public Product createProduct(ProductDTO dto) {
        // Create the product first
        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .stock(dto.getStock())
                .reserved(0) // Initialize reserved to 0
                .availableStock(dto.getStock()) // Initial available stock equals physical stock
                .build();

        Product savedProduct = repository.save(product);
        String barcode = generateProductId(savedProduct.getName());
        savedProduct.setBarcode(barcode);
        
        try {
            String barcodeUrl = barcodeService.generateAndUploadBarcode(barcode);
            savedProduct.setBarcodeImageUrl(barcodeUrl);
        } catch (Exception e) {
            throw new BarcodeGenerationException("Failed to generate/upload barcode: " + e.getMessage(), e);
        }
        
        // Save product with barcode
        savedProduct = repository.save(savedProduct);
        
        // Create category relationship if categoryId is provided
        if (dto.getCategoryId() != null) {
            Category category = categoryService.getCategoryById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + dto.getCategoryId()));
            
            ProductCategory productCategory = ProductCategory.builder()
                    .productId(savedProduct.getId())
                    .categoryId(category.getId())
                    .build();
            
            productCategoryRepository.save(productCategory);
        }
        
        return savedProduct;
    }

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public List<ProductWithCategoryDTO> getAllProductsWithCategories() {
        List<Product> products = repository.findAll();
        return products.stream()
                .map(this::convertToProductWithCategoryDTO)
                .toList();
    }

    public Optional<Product> getProductById(Long id) {
        return repository.findById(id);
    }

    public Optional<ProductWithCategoryDTO> getProductWithCategoryById(Long id) {
        return repository.findById(id)
                .map(this::convertToProductWithCategoryDTO);
    }

    public List<ProductWithCategoryDTO> getProductsByCategory(Long categoryId) {
        List<Product> products = repository.findProductsWithCategories(categoryId);
        return products.stream()
                .map(this::convertToProductWithCategoryDTO)
                .toList();
    }

    @Transactional
    public Product updateProduct(Long id, ProductDTO dto) {
        Product existingProduct = repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        existingProduct.setName(dto.getName());
        existingProduct.setDescription(dto.getDescription());
        existingProduct.setPrice(dto.getPrice());

        // If stock is being updated, recalculate available stock
        if (dto.getStock() != existingProduct.getStock()) {
            existingProduct.setStock(dto.getStock());
            existingProduct.setAvailableStock(dto.getStock() - existingProduct.getReserved());
        }

        Product savedProduct = repository.save(existingProduct);
        
        // Update category relationship if categoryId is provided
        if (dto.getCategoryId() != null) {
            // Remove existing category relationships
            productCategoryRepository.deleteByProductId(id);
            
            // Add new category relationship
            Category category = categoryService.getCategoryById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + dto.getCategoryId()));
            
            ProductCategory productCategory = ProductCategory.builder()
                    .productId(id)
                    .categoryId(category.getId())
                    .build();
            
            productCategoryRepository.save(productCategory);
        }

        return savedProduct;
    }

    /**
     * Update only the physical stock and recalculate available stock
     */
    public Product updateStock(Long productId, int newStock) {
        Product product = repository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        product.setStock(newStock);
        product.setAvailableStock(newStock - product.getReserved());

        return repository.save(product);
    }

    /**
     * Reduce physical stock by the specified quantity
     * 
     * @param productId The ID of the product
     * @param quantity  The quantity to reduce from physical stock
     * @return Updated product
     * @throws ProductNotFoundException if product not found
     * @throws IllegalArgumentException if insufficient stock
     */
    public Product reducePhysicalStock(Long productId, int quantity) {
        Product product = repository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        // Check if we have enough physical stock
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient physical stock. Available: " +
                    product.getStock() + ", Requested: " + quantity);
        }

        // Check if we have enough reserved stock
        if (product.getReserved() < quantity) {
            throw new IllegalArgumentException("Insufficient reserved stock. Available: " +
                    product.getReserved() + ", Requested: " + quantity);
        }

        // Reduce physical stock
        int newPhysicalStock = product.getStock() - quantity;
        product.setStock(newPhysicalStock);

        // Reduce reserved stock
        int newReservedStock = product.getReserved() - quantity;
        product.setReserved(newReservedStock);

        // Recalculate available stock (physical stock - reserved)
        product.setAvailableStock(newPhysicalStock - newReservedStock);

        return repository.save(product);
    }

    /**
     * Get products with available stock > 0 (for display to customers)
     */
    public List<Product> getAvailableProducts() {
        return repository.findByAvailableStockGreaterThan(0);
    }

    /**
     * Get products by category with available stock > 0
     */
    public List<ProductWithCategoryDTO> getAvailableProductsByCategory(Long categoryId) {
        List<Product> products = repository.findProductsWithCategories(categoryId);
        return products.stream()
                .filter(p -> p.getAvailableStock() > 0)
                .map(this::convertToProductWithCategoryDTO)
                .toList();
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        
        // Delete category relationships first
        productCategoryRepository.deleteByProductId(id);
        
        // Then delete the product
        repository.deleteById(id);
    }
    
    /**
     * Convert Product entity to ProductWithCategoryDTO
     */
    private ProductWithCategoryDTO convertToProductWithCategoryDTO(Product product) {
        ProductWithCategoryDTO.ProductWithCategoryDTOBuilder builder = ProductWithCategoryDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .stock(product.getStock())
                .reserved(product.getReserved())
                .availableStock(product.getAvailableStock())
                .price(product.getPrice())
                .barcode(product.getBarcode())
                .barcodeImageUrl(product.getBarcodeImageUrl());
        
        // Get the first category (assuming one category per product for now)
        List<ProductCategory> productCategories = productCategoryRepository.findByProductId(product.getId());
        if (!productCategories.isEmpty()) {
            ProductCategory productCategory = productCategories.get(0);
            Category category = categoryService.getCategoryById(productCategory.getCategoryId()).orElse(null);
            if (category != null) {
                builder.categoryId(category.getId())
                       .categoryName(category.getCategoryName());
            }
        }
        
        return builder.build();
    }

    /**
     * Reduce inventory by updating both physical_stock and reserved columns
     * @param productId The ID of the product
     * @param quantity The quantity to reduce
     * @return Updated product
     * @throws ProductNotFoundException if product not found
     * @throws IllegalArgumentException if quantity is invalid
     */
    @Transactional
    public Product reduceInventory(Long productId, int quantity) {
        System.out.println("=== REDUCING INVENTORY SERVICE ===");
        System.out.println("Product ID: " + productId + ", Quantity: " + quantity);
        
        // Validate inputs
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Find the product
        Product product = repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));
        
        System.out.println("Current stock - Physical: " + product.getStock() + 
                          ", Reserved: " + product.getReserved() + 
                          ", Available: " + product.getAvailableStock());
        
        // Check if we have enough physical stock
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(
                "Insufficient physical stock. Available: " + product.getStock() + 
                ", Requested: " + quantity
            );
        }
        
        // Check if we have enough reserved stock
        if (product.getReserved() < quantity) {
            throw new IllegalArgumentException(
                "Insufficient reserved stock. Available: " + product.getReserved() + 
                ", Requested: " + quantity
            );
        }

        // Reduce physical stock (items leaving warehouse)
        product.setStock(product.getStock() - quantity);
        
        // Reduce reserved stock by the same quantity
        product.setReserved(product.getReserved() - quantity);

        // Update available stock (physical_stock - reserved)
        product.setAvailableStock(product.getStock() - product.getReserved());
        
        System.out.println("After reduction - Physical: " + product.getStock() + 
                          ", Reserved: " + product.getReserved() + 
                          ", Available: " + product.getAvailableStock());
        
        // Save the updated product
        Product updatedProduct = repository.save(product);
        
        System.out.println("✅ Inventory reduced successfully for product: " + product.getName());
        System.out.println("===============================");
        
        return updatedProduct;
    }
}