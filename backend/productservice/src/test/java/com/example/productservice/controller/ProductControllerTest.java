package com.example.productservice.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.productservice.dto.ProductDTO;
import com.example.productservice.dto.ProductWithCategoryDTO;
import com.example.productservice.models.Product;
import com.example.productservice.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(ProductController.class)
@DisplayName("ProductController Integration Tests")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;
    private ProductDTO testProductDTO;
    private ProductWithCategoryDTO testProductWithCategoryDTO;

    @BeforeEach
    void setUp() {
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
                .build();

        testProductDTO = ProductDTO.builder()
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .stock(100)
                .categoryId(1L)
                .imageUrl("http://example.com/image.png")
                .build();

        testProductWithCategoryDTO = ProductWithCategoryDTO.builder()
                .productId(1L)
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .stock(100)
                .reserved(10)
                .availableStock(90)
                .barcode("PRD-20241201120000-testproduct")
                .barcodeImageUrl("http://example.com/barcode.png")
                .categoryId(1L)
                .categoryName("Electronics")
                .build();
    }

    @Test
    @DisplayName("Should create product successfully")
    void testCreateProduct_Success() throws Exception {
        // Given
        when(productService.createProduct(any(ProductDTO.class))).thenReturn(testProduct);

        // When & Then
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProductDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.price").value(99.99))
                .andExpect(jsonPath("$.stock").value(100))
                .andExpect(jsonPath("$.reserved").value(10))
                .andExpect(jsonPath("$.availableStock").value(90))
                .andExpect(jsonPath("$.barcode").value("PRD-20241201120000-testproduct"))
                .andExpect(jsonPath("$.barcodeImageUrl").value("http://example.com/barcode.png"));

        verify(productService).createProduct(any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should create product with empty data")
    void testCreateProduct_EmptyData() throws Exception {
        // Given
        ProductDTO emptyDTO = new ProductDTO(); // Empty DTO
        when(productService.createProduct(any(ProductDTO.class))).thenReturn(testProduct);

        // When & Then
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyDTO)))
                .andExpect(status().isOk());

        verify(productService).createProduct(any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should get all products successfully")
    void testGetAllProducts_Success() throws Exception {
        // Given
        Page<ProductWithCategoryDTO> mockPage = new PageImpl<>(Arrays.asList(testProductWithCategoryDTO));
        when(productService.getAllProductsWithCategories(any(Pageable.class)))
                .thenReturn(mockPage);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].productId").value(1L))
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.content[0].categoryName").value("Electronics"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(productService).getAllProductsWithCategories(any(Pageable.class));
    }

    @Test
    @DisplayName("Should get product by ID successfully")
    void testGetProductById_Success() throws Exception {
        // Given
        when(productService.getProductWithCategoryById(1L))
                .thenReturn(Optional.of(testProductWithCategoryDTO));

        // When & Then
        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1L))
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.categoryName").value("Electronics"));

        verify(productService).getProductWithCategoryById(1L);
    }

    @Test
    @DisplayName("Should return 404 when product not found by ID")
    void testGetProductById_NotFound() throws Exception {
        // Given
        when(productService.getProductWithCategoryById(999L))
                .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());

        verify(productService).getProductWithCategoryById(999L);
    }

    @Test
    @DisplayName("Should get products by category successfully")
    void testGetProductsByCategory_Success() throws Exception {
        // Given
        when(productService.getProductsByCategory(1L))
                .thenReturn(Arrays.asList(testProductWithCategoryDTO));

        // When & Then
        mockMvc.perform(get("/api/products/category/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].productId").value(1L))
                .andExpect(jsonPath("$[0].categoryId").value(1L))
                .andExpect(jsonPath("$[0].categoryName").value("Electronics"));

        verify(productService).getProductsByCategory(1L);
    }

    @Test
    @DisplayName("Should update product successfully")
    void testUpdateProduct_Success() throws Exception {
        // Given
        ProductDTO updateDTO = ProductDTO.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(149.99)
                .stock(150)
                .categoryId(1L)
                .build();

        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Updated Product")
                .description("Updated Description")
                .price(149.99)
                .stock(150)
                .reserved(10)
                .availableStock(140)
                .barcode("PRD-20241201120000-testproduct")
                .build();

        when(productService.updateProduct(eq(1L), any(ProductDTO.class))).thenReturn(updatedProduct);

        // When & Then
        mockMvc.perform(put("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Updated Product"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andExpect(jsonPath("$.price").value(149.99))
                .andExpect(jsonPath("$.stock").value(150));

        verify(productService).updateProduct(eq(1L), any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should return 404 when updating non-existent product")
    void testUpdateProduct_NotFound() throws Exception {
        // Given
        when(productService.updateProduct(eq(999L), any(ProductDTO.class)))
                .thenThrow(new RuntimeException("Product not found"));

        // When & Then
        mockMvc.perform(put("/api/products/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProductDTO)))
                .andExpect(status().isNotFound());

        verify(productService).updateProduct(eq(999L), any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should update product with empty data")
    void testUpdateProduct_EmptyData() throws Exception {
        // Given
        ProductDTO emptyDTO = new ProductDTO(); // Empty DTO
        when(productService.updateProduct(eq(1L), any(ProductDTO.class))).thenReturn(testProduct);

        // When & Then
        mockMvc.perform(put("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyDTO)))
                .andExpect(status().isOk());

        verify(productService).updateProduct(eq(1L), any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should handle empty product list")
    void testGetAllProducts_EmptyList() throws Exception {
        // Given
        Page<ProductWithCategoryDTO> mockPage = new PageImpl<>(Arrays.asList());
        when(productService.getAllProductsWithCategories(any(Pageable.class)))
                .thenReturn(mockPage);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(productService).getAllProductsWithCategories(any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle products without categories")
    void testGetAllProducts_WithoutCategories() throws Exception {
        // Given
        ProductWithCategoryDTO productWithoutCategory = ProductWithCategoryDTO.builder()
                .productId(1L)
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .stock(100)
                .reserved(10)
                .availableStock(90)
                .barcode("PRD-20241201120000-testproduct")
                .build();

        Page<ProductWithCategoryDTO> mockPage = new PageImpl<>(Arrays.asList(productWithoutCategory));
        when(productService.getAllProductsWithCategories(any(Pageable.class)))
                .thenReturn(mockPage);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].productId").value(1L))
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.content[0].categoryId").doesNotExist())
                .andExpect(jsonPath("$.content[0].categoryName").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(productService).getAllProductsWithCategories(any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle large product lists")
    void testGetAllProducts_LargeList() throws Exception {
        // Given
        ProductWithCategoryDTO product1 = ProductWithCategoryDTO.builder()
                .productId(1L)
                .name("Product 1")
                .price(99.99)
                .build();

        ProductWithCategoryDTO product2 = ProductWithCategoryDTO.builder()
                .productId(2L)
                .name("Product 2")
                .price(149.99)
                .build();

        Page<ProductWithCategoryDTO> mockPage = new PageImpl<>(Arrays.asList(product1, product2));
        when(productService.getAllProductsWithCategories(any(Pageable.class)))
                .thenReturn(mockPage);

        // When & Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].productId").value(1L))
                .andExpect(jsonPath("$.content[1].productId").value(2L))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(productService).getAllProductsWithCategories(any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle malformed JSON in create product")
    void testCreateProduct_MalformedJson() throws Exception {
        // Given
        String malformedJson = "{ \"name\": \"Test Product\", \"price\": }";

        // When & Then
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest());

        verify(productService, never()).createProduct(any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should handle malformed JSON in update product")
    void testUpdateProduct_MalformedJson() throws Exception {
        // Given
        String malformedJson = "{ \"name\": \"Updated Product\", \"price\": }";

        // When & Then
        mockMvc.perform(put("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest());

        verify(productService, never()).updateProduct(anyLong(), any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should handle missing content type")
    void testCreateProduct_MissingContentType() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/products")
                .content(objectMapper.writeValueAsString(testProductDTO)))
                .andExpect(status().isUnsupportedMediaType());

        verify(productService, never()).createProduct(any(ProductDTO.class));
    }

    @Test
    @DisplayName("Should handle invalid path variable")
    void testGetProductById_InvalidPath() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/products/invalid"))
                .andExpect(status().isBadRequest());

        verify(productService, never()).getProductWithCategoryById(anyLong());
    }
}
