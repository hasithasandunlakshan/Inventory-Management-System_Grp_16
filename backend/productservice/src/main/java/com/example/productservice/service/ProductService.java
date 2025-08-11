package com.example.productservice.service;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.models.Product;
import com.example.productservice.repository.ProductRepository;
import com.example.productservice.exception.ProductNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

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

        return repository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        repository.deleteById(id);
    }
}