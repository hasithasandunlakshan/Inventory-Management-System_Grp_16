package com.example.productservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.exception.ProductNotFoundException;
import com.example.productservice.models.Product;
import com.example.productservice.repository.ProductRepository;

@Service
public class ProductService {


    private final ProductRepository repository;

    private final BarcodeService barcodeService;

    public ProductService(ProductRepository repository, BarcodeService barcodeService) {
        this.repository = repository;
        this.barcodeService = barcodeService;
    }
    
    public String generateProductId(String productName, Long productId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String cleanName = productName.toLowerCase().replaceAll("[^a-z0-9]", "").replaceAll("\\s+", "");

       

        return "PRD-" + timestamp + "-" + cleanName;
    }

    public Product createProduct(ProductDTO dto) {

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .categoryId(dto.getCategoryId())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .stock(dto.getStock())
                .reserved(0) // Initialize reserved to 0
                .availableStock(dto.getStock()) // Initial available stock equals physical stock
                .build();
        
        Product savedProduct= repository.save(product);
        Long generatedId = savedProduct.getId();
        String barcode = generateProductId(savedProduct.getName(),generatedId); // e.g., PROD-0000123
        product.setBarcode(barcode);
         try {
        String barcodeUrl = barcodeService.generateAndUploadBarcode(barcode);
        savedProduct.setBarcodeImageUrl(barcodeUrl);
    } catch (Exception e) {
        throw new RuntimeException("Failed to generate/upload barcode ", e);
    }
        return repository.save(savedProduct);
    }

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return repository.findById(id);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return repository.findByCategoryId(categoryId);
    }

    public Product updateProduct(Long id, ProductDTO dto) {
        Product existingProduct = repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        existingProduct.setName(dto.getName());
        existingProduct.setDescription(dto.getDescription());
        existingProduct.setCategoryId(dto.getCategoryId());
        existingProduct.setPrice(dto.getPrice());
        
        // If stock is being updated, recalculate available stock
        if (dto.getStock() != existingProduct.getStock()) {
            existingProduct.setStock(dto.getStock());
            existingProduct.setAvailableStock(dto.getStock() - existingProduct.getReserved());
        }

        return repository.save(existingProduct);
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
     * Get products with available stock > 0 (for display to customers)
     */
    public List<Product> getAvailableProducts() {
        return repository.findByAvailableStockGreaterThan(0);
    }
    
    /**
     * Get products by category with available stock > 0
     */
    public List<Product> getAvailableProductsByCategory(Long categoryId) {
        return repository.findByCategoryIdAndAvailableStockGreaterThan(categoryId, 0);
    }

    public void deleteProduct(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        repository.deleteById(id);
    }
}