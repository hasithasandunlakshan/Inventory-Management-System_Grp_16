package com.example.productservice.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.example.productservice.models.Category;
import com.example.productservice.models.Product;
import com.example.productservice.models.ProductCategory;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("ProductRepository Integration Tests")
class ProductRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct1;
    private Product testProduct2;
    private Product testProduct3;
    private Category testCategory1;
    private Category testCategory2;

    @BeforeEach
    void setUp() {
        // Create test categories
        testCategory1 = Category.builder()
                .categoryName("Electronics")
                .build();
        testCategory1 = entityManager.persistAndFlush(testCategory1);

        testCategory2 = Category.builder()
                .categoryName("Books")
                .build();
        testCategory2 = entityManager.persistAndFlush(testCategory2);

        // Create test products
        testProduct1 = Product.builder()
                .name("Laptop")
                .description("Gaming Laptop")
                .price(999.99)
                .stock(50)
                .reserved(5)
                .availableStock(45)
                .barcode("PRD-20241201120000-laptop")
                .barcodeImageUrl("http://example.com/laptop-barcode.png")
                .build();

        testProduct2 = Product.builder()
                .name("Book")
                .description("Programming Book")
                .price(49.99)
                .stock(100)
                .reserved(10)
                .availableStock(90)
                .barcode("PRD-20241201120001-book")
                .barcodeImageUrl("http://example.com/book-barcode.png")
                .build();

        testProduct3 = Product.builder()
                .name("Phone")
                .description("Smartphone")
                .price(699.99)
                .stock(0) // Out of stock
                .reserved(0)
                .availableStock(0)
                .barcode("PRD-20241201120002-phone")
                .barcodeImageUrl("http://example.com/phone-barcode.png")
                .build();

        // Persist products
        testProduct1 = entityManager.persistAndFlush(testProduct1);
        testProduct2 = entityManager.persistAndFlush(testProduct2);
        testProduct3 = entityManager.persistAndFlush(testProduct3);

        // Create product-category relationships
        ProductCategory productCategory1 = ProductCategory.builder()
                .productId(testProduct1.getId())
                .categoryId(testCategory1.getId())
                .build();
        entityManager.persistAndFlush(productCategory1);

        ProductCategory productCategory2 = ProductCategory.builder()
                .productId(testProduct2.getId())
                .categoryId(testCategory2.getId())
                .build();
        entityManager.persistAndFlush(productCategory2);

        ProductCategory productCategory3 = ProductCategory.builder()
                .productId(testProduct3.getId())
                .categoryId(testCategory1.getId())
                .build();
        entityManager.persistAndFlush(productCategory3);

        entityManager.clear();
    }

    @Test
    @DisplayName("Should find all products")
    void testFindAll() {
        // When
        List<Product> products = productRepository.findAll();

        // Then
        assertEquals(3, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Book")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Phone")));
    }

    @Test
    @DisplayName("Should find product by ID")
    void testFindById() {
        // When
        Optional<Product> product = productRepository.findById(testProduct1.getId());

        // Then
        assertTrue(product.isPresent());
        assertEquals("Laptop", product.get().getName());
        assertEquals(999.99, product.get().getPrice());
    }

    @Test
    @DisplayName("Should return empty when product not found by ID")
    void testFindById_NotFound() {
        // When
        Optional<Product> product = productRepository.findById(999L);

        // Then
        assertFalse(product.isPresent());
    }

    @Test
    @DisplayName("Should find products with available stock greater than specified amount")
    void testFindByAvailableStockGreaterThan() {
        // When
        List<Product> products = productRepository.findByAvailableStockGreaterThan(0);

        // Then
        assertEquals(2, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Book")));
        assertFalse(products.stream().anyMatch(p -> p.getName().equals("Phone")));
    }

    @Test
    @DisplayName("Should find products with available stock greater than specific amount")
    void testFindByAvailableStockGreaterThan_SpecificAmount() {
        // When
        List<Product> products = productRepository.findByAvailableStockGreaterThan(50);

        // Then
        assertEquals(1, products.size());
        assertEquals("Book", products.get(0).getName());
        assertTrue(products.get(0).getAvailableStock() > 50);
    }

    @Test
    @DisplayName("Should find product by barcode")
    void testFindByBarcode() {
        // When
        Optional<Product> product = productRepository.findByBarcode("PRD-20241201120000-laptop");

        // Then
        assertTrue(product.isPresent());
        assertEquals("Laptop", product.get().getName());
        assertEquals(999.99, product.get().getPrice());
    }

    @Test
    @DisplayName("Should return empty when product not found by barcode")
    void testFindByBarcode_NotFound() {
        // When
        Optional<Product> product = productRepository.findByBarcode("INVALID-BARCODE");

        // Then
        assertFalse(product.isPresent());
    }

    @Test
    @DisplayName("Should find products with categories - all products")
    void testFindProductsWithCategories_AllProducts() {
        // When
        List<Product> products = productRepository.findProductsWithCategories(null);

        // Then
        assertEquals(3, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Book")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Phone")));
    }

    @Test
    @DisplayName("Should find products with categories - specific category")
    void testFindProductsWithCategories_SpecificCategory() {
        // When
        List<Product> products = productRepository.findProductsWithCategories(testCategory1.getId());

        // Then
        assertEquals(2, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Phone")));
        assertFalse(products.stream().anyMatch(p -> p.getName().equals("Book")));
    }

    @Test
    @DisplayName("Should find products with categories - non-existent category")
    void testFindProductsWithCategories_NonExistentCategory() {
        // When
        List<Product> products = productRepository.findProductsWithCategories(999L);

        // Then
        assertTrue(products.isEmpty());
    }

    @Test
    @DisplayName("Should save new product")
    void testSave() {
        // Given
        Product newProduct = Product.builder()
                .name("Tablet")
                .description("Android Tablet")
                .price(299.99)
                .stock(25)
                .reserved(2)
                .availableStock(23)
                .barcode("PRD-20241201120003-tablet")
                .barcodeImageUrl("http://example.com/tablet-barcode.png")
                .build();

        // When
        Product savedProduct = productRepository.save(newProduct);

        // Then
        assertNotNull(savedProduct.getId());
        assertEquals("Tablet", savedProduct.getName());
        assertEquals(299.99, savedProduct.getPrice());
        assertEquals(25, savedProduct.getStock());
    }

    @Test
    @DisplayName("Should update existing product")
    void testUpdate() {
        // Given
        testProduct1.setName("Updated Laptop");
        testProduct1.setPrice(1099.99);

        // When
        Product updatedProduct = productRepository.save(testProduct1);

        // Then
        assertEquals(testProduct1.getId(), updatedProduct.getId());
        assertEquals("Updated Laptop", updatedProduct.getName());
        assertEquals(1099.99, updatedProduct.getPrice());
    }

    @Test
    @DisplayName("Should delete product by ID")
    void testDeleteById() {
        // Given
        Long productId = testProduct1.getId();

        // When
        productRepository.deleteById(productId);

        // Then
        Optional<Product> deletedProduct = productRepository.findById(productId);
        assertFalse(deletedProduct.isPresent());
    }

    @Test
    @DisplayName("Should check if product exists by ID")
    void testExistsById() {
        // When & Then
        assertTrue(productRepository.existsById(testProduct1.getId()));
        assertTrue(productRepository.existsById(testProduct2.getId()));
        assertTrue(productRepository.existsById(testProduct3.getId()));
        assertFalse(productRepository.existsById(999L));
    }

    @Test
    @DisplayName("Should find products with zero available stock")
    void testFindByAvailableStockGreaterThan_Zero() {
        // When
        List<Product> products = productRepository.findByAvailableStockGreaterThan(0);

        // Then
        assertEquals(2, products.size());
        assertTrue(products.stream().allMatch(p -> p.getAvailableStock() > 0));
    }

    @Test
    @DisplayName("Should find products with high available stock")
    void testFindByAvailableStockGreaterThan_HighValue() {
        // When
        List<Product> products = productRepository.findByAvailableStockGreaterThan(100);

        // Then
        assertTrue(products.isEmpty());
    }

    @Test
    @DisplayName("Should handle case-sensitive barcode search")
    void testFindByBarcode_CaseSensitive() {
        // Given
        String upperCaseBarcode = "PRD-20241201120000-LAPTOP";

        // When
        Optional<Product> product = productRepository.findByBarcode(upperCaseBarcode);

        // Then
        assertFalse(product.isPresent()); // Should be case-sensitive
    }

    @Test
    @DisplayName("Should find products with exact available stock")
    void testFindByAvailableStockGreaterThan_ExactValue() {
        // When
        List<Product> products = productRepository.findByAvailableStockGreaterThan(45);

        // Then
        assertEquals(1, products.size());
        assertEquals("Book", products.get(0).getName());
        assertTrue(products.get(0).getAvailableStock() > 45);
    }

    @Test
    @DisplayName("Should handle empty database")
    void testFindAll_EmptyDatabase() {
        // Given
        // First delete all ProductCategory relationships to avoid foreign key
        // constraint violations
        entityManager.getEntityManager()
                .createQuery("DELETE FROM ProductCategory")
                .executeUpdate();
        entityManager.flush();

        // Then delete all products
        productRepository.deleteAll();
        entityManager.flush();

        // When
        List<Product> products = productRepository.findAll();

        // Then
        assertTrue(products.isEmpty());
    }

    @Test
    @DisplayName("Should find products with categories - books category")
    void testFindProductsWithCategories_BooksCategory() {
        // When
        List<Product> products = productRepository.findProductsWithCategories(testCategory2.getId());

        // Then
        assertEquals(1, products.size());
        assertEquals("Book", products.get(0).getName());
    }

    @Test
    @DisplayName("Should handle null barcode search")
    void testFindByBarcode_NullBarcode() {
        // When
        Optional<Product> product = productRepository.findByBarcode(null);

        // Then
        assertFalse(product.isPresent());
    }

    @Test
    @DisplayName("Should handle empty string barcode search")
    void testFindByBarcode_EmptyString() {
        // When
        Optional<Product> product = productRepository.findByBarcode("");

        // Then
        assertFalse(product.isPresent());
    }
}
