package com.example.productservice.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.models.Category;
import com.example.productservice.models.Product;
import com.example.productservice.models.ProductCategory;
import com.example.productservice.config.TestConfig;
import com.example.productservice.repository.CategoryRepository;
import com.example.productservice.repository.ProductCategoryRepository;
import com.example.productservice.repository.ProductRepository;
import com.example.productservice.service.ProductService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
@DisplayName("Product Service Integration Tests")
class ProductServiceIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    private Category testCategory;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Clean up existing data
        productCategoryRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        // Create test category
        testCategory = Category.builder()
                .categoryName("Electronics")
                .build();
        testCategory = categoryRepository.save(testCategory);

        // Create test product
        testProduct = Product.builder()
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .stock(100)
                .reserved(10)
                .availableStock(90)
                .barcode("PRD-20241201120000-testproduct")
                .barcodeImageUrl("http://example.com/barcode.png")
                .imageUrl("http://example.com/image.png")
                .build();
        testProduct = productRepository.save(testProduct);

        // Create product-category relationship
        ProductCategory productCategory = ProductCategory.builder()
                .productId(testProduct.getId())
                .categoryId(testCategory.getId())
                .build();
        productCategoryRepository.save(productCategory);
    }

    @Test
    @DisplayName("Should create product through service layer")
    void testCreateProduct_ServiceLayer() {
        // Given
        ProductDTO productDTO = ProductDTO.builder()
                .name("New Product")
                .description("New Description")
                .price(149.99)
                .stock(50)
                .categoryId(testCategory.getId())
                .imageUrl("http://example.com/new-image.png")
                .build();

        // When
        Product createdProduct = productService.createProduct(productDTO);

        // Then
        assertNotNull(createdProduct);
        assertNotNull(createdProduct.getId());
        assertEquals("New Product", createdProduct.getName());
        assertEquals("New Description", createdProduct.getDescription());
        assertEquals(149.99, createdProduct.getPrice());
        assertEquals(50, createdProduct.getStock());
        assertEquals(0, createdProduct.getReserved());
        assertEquals(50, createdProduct.getAvailableStock());
        assertNotNull(createdProduct.getBarcode());
        assertNotNull(createdProduct.getBarcodeImageUrl());

        // Verify product is saved in database
        Optional<Product> savedProduct = productRepository.findById(createdProduct.getId());
        assertTrue(savedProduct.isPresent());
        assertEquals("New Product", savedProduct.get().getName());

        // Verify category relationship is created
        List<ProductCategory> productCategories = productCategoryRepository.findByProductId(createdProduct.getId());
        assertFalse(productCategories.isEmpty());
        assertEquals(testCategory.getId(), productCategories.get(0).getCategoryId());
    }

    @Test
    @DisplayName("Should get all products through service layer")
    void testGetAllProducts_ServiceLayer() {
        // When
        List<Product> products = productService.getAllProducts();

        // Then
        assertNotNull(products);
        assertEquals(1, products.size());
        assertEquals("Test Product", products.get(0).getName());
    }

    @Test
    @DisplayName("Should get product by ID through service layer")
    void testGetProductById_ServiceLayer() {
        // When
        Optional<Product> product = productService.getProductById(testProduct.getId());

        // Then
        assertTrue(product.isPresent());
        assertEquals("Test Product", product.get().getName());
        assertEquals(99.99, product.get().getPrice());
    }

    @Test
    @DisplayName("Should update product through service layer")
    void testUpdateProduct_ServiceLayer() {
        // Given
        ProductDTO updateDTO = ProductDTO.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(199.99)
                .stock(150)
                .categoryId(testCategory.getId())
                .build();

        // When
        Product updatedProduct = productService.updateProduct(testProduct.getId(), updateDTO);

        // Then
        assertNotNull(updatedProduct);
        assertEquals("Updated Product", updatedProduct.getName());
        assertEquals("Updated Description", updatedProduct.getDescription());
        assertEquals(199.99, updatedProduct.getPrice());
        assertEquals(150, updatedProduct.getStock());
        assertEquals(140, updatedProduct.getAvailableStock()); // 150 - 10 reserved

        // Verify product is updated in database
        Optional<Product> savedProduct = productRepository.findById(testProduct.getId());
        assertTrue(savedProduct.isPresent());
        assertEquals("Updated Product", savedProduct.get().getName());
    }

    @Test
    @DisplayName("Should delete product through service layer")
    void testDeleteProduct_ServiceLayer() {
        // When
        productService.deleteProduct(testProduct.getId());

        // Then
        assertFalse(productRepository.existsById(testProduct.getId()));

        // Verify category relationships are also deleted
        List<ProductCategory> productCategories = productCategoryRepository.findByProductId(testProduct.getId());
        assertTrue(productCategories.isEmpty());
    }

    @Test
    @DisplayName("Should reduce inventory through service layer")
    void testReduceInventory_ServiceLayer() {
        // Given
        int quantity = 5;

        // When
        Product updatedProduct = productService.reduceInventory(testProduct.getId(), quantity);

        // Then
        assertNotNull(updatedProduct);
        assertEquals(95, updatedProduct.getStock()); // 100 - 5
        assertEquals(5, updatedProduct.getReserved()); // 10 - 5
        assertEquals(90, updatedProduct.getAvailableStock()); // 95 - 5

        // Verify product is updated in database
        Optional<Product> savedProduct = productRepository.findById(testProduct.getId());
        assertTrue(savedProduct.isPresent());
        assertEquals(95, savedProduct.get().getStock());
    }

    @Test
    @DisplayName("Should restock product through service layer")
    void testRestockProduct_ServiceLayer() {
        // Given
        int quantity = 50;

        // When
        Product restockedProduct = productService.restockProduct(testProduct.getId(), quantity);

        // Then
        assertNotNull(restockedProduct);
        assertEquals(150, restockedProduct.getStock()); // 100 + 50
        assertEquals(10, restockedProduct.getReserved()); // unchanged
        assertEquals(140, restockedProduct.getAvailableStock()); // 150 - 10

        // Verify product is updated in database
        Optional<Product> savedProduct = productRepository.findById(testProduct.getId());
        assertTrue(savedProduct.isPresent());
        assertEquals(150, savedProduct.get().getStock());
    }

    @Test
    @DisplayName("Should get product by barcode through service layer")
    void testGetProductByBarcode_ServiceLayer() {
        // When
        var productWithCategory = productService.getProductByBarcode("PRD-20241201120000-testproduct");

        // Then
        assertNotNull(productWithCategory);
        assertEquals("Test Product", productWithCategory.getName());
        assertEquals(testCategory.getId(), productWithCategory.getCategoryId());
        assertEquals(testCategory.getCategoryName(), productWithCategory.getCategoryName());
    }

    @Test
    @DisplayName("Should calculate total available inventory cost through service layer")
    void testCalculateTotalAvailableInventoryCost_ServiceLayer() {
        // When
        double totalCost = productService.calculateTotalAvailableInventoryCost();

        // Then
        assertEquals(99.99 * 90, totalCost); // price * availableStock
    }

    @Test
    @DisplayName("Should get products with available stock through service layer")
    void testGetProductsWithAvailableStock_ServiceLayer() {
        // When
        int count = productService.getProductsWithAvailableStock();

        // Then
        assertEquals(1, count);
    }

    @Test
    @DisplayName("Should handle concurrent product creation")
    void testConcurrentProductCreation() {
        // Given
        ProductDTO productDTO1 = ProductDTO.builder()
                .name("Concurrent Product 1")
                .description("Concurrent Description 1")
                .price(99.99)
                .stock(50)
                .categoryId(testCategory.getId())
                .build();

        ProductDTO productDTO2 = ProductDTO.builder()
                .name("Concurrent Product 2")
                .description("Concurrent Description 2")
                .price(149.99)
                .stock(75)
                .categoryId(testCategory.getId())
                .build();

        // When
        Product product1 = productService.createProduct(productDTO1);
        Product product2 = productService.createProduct(productDTO2);

        // Then
        assertNotNull(product1);
        assertNotNull(product2);
        assertNotEquals(product1.getId(), product2.getId());
        assertEquals("Concurrent Product 1", product1.getName());
        assertEquals("Concurrent Product 2", product2.getName());

        // Verify both products are saved
        assertTrue(productRepository.existsById(product1.getId()));
        assertTrue(productRepository.existsById(product2.getId()));
    }

    @Test
    @DisplayName("Should handle product with no category")
    void testProductWithoutCategory() {
        // Given
        ProductDTO productDTO = ProductDTO.builder()
                .name("Product Without Category")
                .description("Description")
                .price(99.99)
                .stock(50)
                .categoryId(null) // No category
                .build();

        // When
        Product createdProduct = productService.createProduct(productDTO);

        // Then
        assertNotNull(createdProduct);
        assertEquals("Product Without Category", createdProduct.getName());

        // Verify no category relationship is created
        List<ProductCategory> productCategories = productCategoryRepository.findByProductId(createdProduct.getId());
        assertTrue(productCategories.isEmpty());
    }

    @Test
    @DisplayName("Should handle large product list")
    void testLargeProductList() {
        // Given
        for (int i = 0; i < 100; i++) {
            ProductDTO productDTO = ProductDTO.builder()
                    .name("Product " + i)
                    .description("Description " + i)
                    .price(99.99 + i)
                    .stock(50 + i)
                    .categoryId(testCategory.getId())
                    .build();
            productService.createProduct(productDTO);
        }

        // When
        List<Product> products = productService.getAllProducts();

        // Then
        assertEquals(101, products.size()); // 100 new + 1 existing
    }
}
