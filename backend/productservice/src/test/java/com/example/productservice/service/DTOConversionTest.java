package com.example.productservice.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.productservice.dto.ProductWithCategoryDTO;
import com.example.productservice.models.Category;
import com.example.productservice.models.Product;
import com.example.productservice.models.ProductCategory;
import com.example.productservice.repository.ProductCategoryRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("DTO Conversion Tests")
class DTOConversionTest {

        @Mock
        private ProductCategoryRepository productCategoryRepository;

        @Mock
        private CategoryService categoryService;

        @InjectMocks
        private ProductService productService;

        private Product testProduct;
        private Category testCategory;
        private ProductCategory testProductCategory;

        @BeforeEach
        void setUp() {
                testCategory = Category.builder()
                                .id(1L)
                                .categoryName("Electronics")
                                .build();

                testProduct = Product.builder()
                                .id(1L)
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

                testProductCategory = ProductCategory.builder()
                                .productId(1L)
                                .categoryId(1L)
                                .build();
        }

        @Test
        @DisplayName("Should convert Product to ProductWithCategoryDTO with category")
        void testConvertToProductWithCategoryDTO_WithCategory() {
                // Given
                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList(testProductCategory));
                when(categoryService.getCategoryById(1L))
                                .thenReturn(Optional.of(testCategory));

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertEquals(testProduct.getId(), result.getProductId());
                assertEquals(testProduct.getName(), result.getName());
                assertEquals(testProduct.getDescription(), result.getDescription());
                assertEquals(testProduct.getImageUrl(), result.getImageUrl());
                assertEquals(testProduct.getStock(), result.getStock());
                assertEquals(testProduct.getReserved(), result.getReserved());
                assertEquals(testProduct.getAvailableStock(), result.getAvailableStock());
                assertEquals(testProduct.getPrice(), result.getPrice());
                assertEquals(testProduct.getBarcode(), result.getBarcode());
                assertEquals(testProduct.getBarcodeImageUrl(), result.getBarcodeImageUrl());
                assertEquals(testCategory.getId(), result.getCategoryId());
                assertEquals(testCategory.getCategoryName(), result.getCategoryName());

                verify(productCategoryRepository).findByProductId(1L);
                verify(categoryService).getCategoryById(1L);
        }

        @Test
        @DisplayName("Should convert Product to ProductWithCategoryDTO without category")
        void testConvertToProductWithCategoryDTO_WithoutCategory() {
                // Given
                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertEquals(testProduct.getId(), result.getProductId());
                assertEquals(testProduct.getName(), result.getName());
                assertEquals(testProduct.getDescription(), result.getDescription());
                assertEquals(testProduct.getImageUrl(), result.getImageUrl());
                assertEquals(testProduct.getStock(), result.getStock());
                assertEquals(testProduct.getReserved(), result.getReserved());
                assertEquals(testProduct.getAvailableStock(), result.getAvailableStock());
                assertEquals(testProduct.getPrice(), result.getPrice());
                assertEquals(testProduct.getBarcode(), result.getBarcode());
                assertEquals(testProduct.getBarcodeImageUrl(), result.getBarcodeImageUrl());
                assertNull(result.getCategoryId());
                assertNull(result.getCategoryName());

                verify(productCategoryRepository).findByProductId(1L);
                verify(categoryService, never()).getCategoryById(anyLong());
        }

        @Test
        @DisplayName("Should convert Product to ProductWithCategoryDTO with null category")
        void testConvertToProductWithCategoryDTO_WithNullCategory() {
                // Given
                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList(testProductCategory));
                when(categoryService.getCategoryById(1L))
                                .thenReturn(Optional.empty());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertEquals(testProduct.getId(), result.getProductId());
                assertEquals(testProduct.getName(), result.getName());
                assertNull(result.getCategoryId());
                assertNull(result.getCategoryName());

                verify(productCategoryRepository).findByProductId(1L);
                verify(categoryService).getCategoryById(1L);
        }

        @Test
        @DisplayName("Should convert Product to ProductWithCategoryDTO with multiple categories (first one)")
        void testConvertToProductWithCategoryDTO_WithMultipleCategories() {
                // Given
                ProductCategory category2 = ProductCategory.builder()
                                .productId(1L)
                                .categoryId(2L)
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList(testProductCategory, category2));
                when(categoryService.getCategoryById(1L))
                                .thenReturn(Optional.of(testCategory));

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertEquals(testCategory.getId(), result.getCategoryId());
                assertEquals(testCategory.getCategoryName(), result.getCategoryName());
                // Should use the first category
                verify(categoryService).getCategoryById(1L);
                verify(categoryService, never()).getCategoryById(2L);
        }

        @Test
        @DisplayName("Should convert Product with null values to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithNullValues() {
                // Given
                Product productWithNulls = Product.builder()
                                .id(1L)
                                .name("Test Product")
                                .description(null)
                                .price(99.99)
                                .stock(100)
                                .reserved(0)
                                .availableStock(100)
                                .barcode(null)
                                .barcodeImageUrl(null)
                                .imageUrl(null)
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithNulls);

                // Then
                assertNotNull(result);
                assertEquals(productWithNulls.getId(), result.getProductId());
                assertEquals(productWithNulls.getName(), result.getName());
                assertNull(result.getDescription());
                assertNull(result.getImageUrl());
                assertNull(result.getBarcode());
                assertNull(result.getBarcodeImageUrl());
                assertNull(result.getCategoryId());
                assertNull(result.getCategoryName());
        }

        @Test
        @DisplayName("Should convert Product with zero values to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithZeroValues() {
                // Given
                Product productWithZeros = Product.builder()
                                .id(1L)
                                .name("Test Product")
                                .description("Test Description")
                                .price(0.0)
                                .stock(0)
                                .reserved(0)
                                .availableStock(0)
                                .barcode("PRD-20241201120000-testproduct")
                                .barcodeImageUrl("http://example.com/barcode.png")
                                .imageUrl("http://example.com/image.png")
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithZeros);

                // Then
                assertNotNull(result);
                assertEquals(productWithZeros.getId(), result.getProductId());
                assertEquals(productWithZeros.getName(), result.getName());
                assertEquals(0.0, result.getPrice());
                assertEquals(0, result.getStock());
                assertEquals(0, result.getReserved());
                assertEquals(0, result.getAvailableStock());
        }

        @Test
        @DisplayName("Should convert Product with negative values to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithNegativeValues() {
                // Given
                Product productWithNegatives = Product.builder()
                                .id(1L)
                                .name("Test Product")
                                .description("Test Description")
                                .price(-99.99)
                                .stock(-100)
                                .reserved(-10)
                                .availableStock(-90)
                                .barcode("PRD-20241201120000-testproduct")
                                .barcodeImageUrl("http://example.com/barcode.png")
                                .imageUrl("http://example.com/image.png")
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithNegatives);

                // Then
                assertNotNull(result);
                assertEquals(productWithNegatives.getId(), result.getProductId());
                assertEquals(productWithNegatives.getName(), result.getName());
                assertEquals(-99.99, result.getPrice());
                assertEquals(-100, result.getStock());
                assertEquals(-10, result.getReserved());
                assertEquals(-90, result.getAvailableStock());
        }

        @Test
        @DisplayName("Should convert Product with large values to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithLargeValues() {
                // Given
                Product productWithLargeValues = Product.builder()
                                .id(Long.MAX_VALUE)
                                .name("Test Product with Very Long Name That Exceeds Normal Length")
                                .description("Test Description with Very Long Text That Exceeds Normal Length and Contains Special Characters: @#$%^&*()")
                                .price(Double.MAX_VALUE)
                                .stock(Integer.MAX_VALUE)
                                .reserved(Integer.MAX_VALUE)
                                .availableStock(Integer.MAX_VALUE)
                                .barcode("PRD-20241201120000-testproductwithverylongbarcode")
                                .barcodeImageUrl("http://example.com/very-long-barcode-image-url.png")
                                .imageUrl("http://example.com/very-long-image-url.png")
                                .build();

                when(productCategoryRepository.findByProductId(Long.MAX_VALUE))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithLargeValues);

                // Then
                assertNotNull(result);
                assertEquals(productWithLargeValues.getId(), result.getProductId());
                assertEquals(productWithLargeValues.getName(), result.getName());
                assertEquals(productWithLargeValues.getDescription(), result.getDescription());
                assertEquals(productWithLargeValues.getPrice(), result.getPrice());
                assertEquals(productWithLargeValues.getStock(), result.getStock());
                assertEquals(productWithLargeValues.getReserved(), result.getReserved());
                assertEquals(productWithLargeValues.getAvailableStock(), result.getAvailableStock());
                assertEquals(productWithLargeValues.getBarcode(), result.getBarcode());
                assertEquals(productWithLargeValues.getBarcodeImageUrl(), result.getBarcodeImageUrl());
                assertEquals(productWithLargeValues.getImageUrl(), result.getImageUrl());
        }

        @Test
        @DisplayName("Should convert Product with unicode characters to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithUnicodeCharacters() {
                // Given
                Product productWithUnicode = Product.builder()
                                .id(1L)
                                .name("测试产品")
                                .description("产品描述：这是一个测试产品")
                                .price(99.99)
                                .stock(100)
                                .reserved(10)
                                .availableStock(90)
                                .barcode("PRD-20241201120000-测试产品")
                                .barcodeImageUrl("http://example.com/测试产品-barcode.png")
                                .imageUrl("http://example.com/测试产品-image.png")
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithUnicode);

                // Then
                assertNotNull(result);
                assertEquals(productWithUnicode.getId(), result.getProductId());
                assertEquals(productWithUnicode.getName(), result.getName());
                assertEquals(productWithUnicode.getDescription(), result.getDescription());
                assertEquals(productWithUnicode.getBarcode(), result.getBarcode());
                assertEquals(productWithUnicode.getBarcodeImageUrl(), result.getBarcodeImageUrl());
                assertEquals(productWithUnicode.getImageUrl(), result.getImageUrl());
        }

        @Test
        @DisplayName("Should convert Product with special characters to ProductWithCategoryDTO")
        void testConvertToProductWithCategoryDTO_WithSpecialCharacters() {
                // Given
                Product productWithSpecialChars = Product.builder()
                                .id(1L)
                                .name("Test Product @#$%^&*()")
                                .description("Description with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?")
                                .price(99.99)
                                .stock(100)
                                .reserved(10)
                                .availableStock(90)
                                .barcode("PRD-20241201120000-testproduct@#$%")
                                .barcodeImageUrl("http://example.com/test-product@#$%-barcode.png")
                                .imageUrl("http://example.com/test-product@#$%-image.png")
                                .build();

                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(productWithSpecialChars);

                // Then
                assertNotNull(result);
                assertEquals(productWithSpecialChars.getId(), result.getProductId());
                assertEquals(productWithSpecialChars.getName(), result.getName());
                assertEquals(productWithSpecialChars.getDescription(), result.getDescription());
                assertEquals(productWithSpecialChars.getBarcode(), result.getBarcode());
                assertEquals(productWithSpecialChars.getBarcodeImageUrl(), result.getBarcodeImageUrl());
                assertEquals(productWithSpecialChars.getImageUrl(), result.getImageUrl());
        }

        @Test
        @DisplayName("Should handle empty product category list")
        void testConvertToProductWithCategoryDTO_EmptyProductCategoryList() {
                // Given
                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(Arrays.asList());

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertNull(result.getCategoryId());
                assertNull(result.getCategoryName());
                verify(productCategoryRepository).findByProductId(1L);
                verify(categoryService, never()).getCategoryById(anyLong());
        }

        @Test
        @DisplayName("Should handle null product category list")
        void testConvertToProductWithCategoryDTO_NullProductCategoryList() {
                // Given
                when(productCategoryRepository.findByProductId(1L))
                                .thenReturn(null);

                // When
                ProductWithCategoryDTO result = productService.convertToProductWithCategoryDTO(testProduct);

                // Then
                assertNotNull(result);
                assertNull(result.getCategoryId());
                assertNull(result.getCategoryName());
                verify(productCategoryRepository).findByProductId(1L);
                verify(categoryService, never()).getCategoryById(anyLong());
        }
}
