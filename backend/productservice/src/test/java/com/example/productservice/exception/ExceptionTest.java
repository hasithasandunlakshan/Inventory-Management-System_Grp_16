package com.example.productservice.exception;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Exception Classes Tests")
class ExceptionTest {

    @Test
    @DisplayName("Should create ProductNotFoundException with message")
    void testProductNotFoundException_WithMessage() {
        // Given
        String message = "Product not found";

        // When
        ProductNotFoundException exception = new ProductNotFoundException(message);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with ID")
    void testProductNotFoundException_WithId() {
        // Given
        Long id = 123L;

        // When
        ProductNotFoundException exception = new ProductNotFoundException(id);

        // Then
        assertNotNull(exception);
        assertEquals("Product not found with id: 123", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with null ID")
    void testProductNotFoundException_WithNullId() {
        // Given
        Long id = null;

        // When
        ProductNotFoundException exception = new ProductNotFoundException(id);

        // Then
        assertNotNull(exception);
        assertEquals("Product not found with id: null", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with zero ID")
    void testProductNotFoundException_WithZeroId() {
        // Given
        Long id = 0L;

        // When
        ProductNotFoundException exception = new ProductNotFoundException(id);

        // Then
        assertNotNull(exception);
        assertEquals("Product not found with id: 0", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with negative ID")
    void testProductNotFoundException_WithNegativeId() {
        // Given
        Long id = -1L;

        // When
        ProductNotFoundException exception = new ProductNotFoundException(id);

        // Then
        assertNotNull(exception);
        assertEquals("Product not found with id: -1", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with empty message")
    void testProductNotFoundException_WithEmptyMessage() {
        // Given
        String message = "";

        // When
        ProductNotFoundException exception = new ProductNotFoundException(message);

        // Then
        assertNotNull(exception);
        assertEquals("", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create ProductNotFoundException with null message")
    void testProductNotFoundException_WithNullMessage() {
        // Given
        String message = null;

        // When
        ProductNotFoundException exception = new ProductNotFoundException(message);

        // Then
        assertNotNull(exception);
        assertNull(exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with message only")
    void testBarcodeGenerationException_WithMessage() {
        // Given
        String message = "Barcode generation failed";

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with message and cause")
    void testBarcodeGenerationException_WithMessageAndCause() {
        // Given
        String message = "Barcode generation failed";
        RuntimeException cause = new RuntimeException("Network error");

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message, cause);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with null message")
    void testBarcodeGenerationException_WithNullMessage() {
        // Given
        String message = null;

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message);

        // Then
        assertNotNull(exception);
        assertNull(exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with null message and cause")
    void testBarcodeGenerationException_WithNullMessageAndCause() {
        // Given
        String message = null;
        RuntimeException cause = new RuntimeException("Network error");

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message, cause);

        // Then
        assertNotNull(exception);
        assertNull(exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with message and null cause")
    void testBarcodeGenerationException_WithMessageAndNullCause() {
        // Given
        String message = "Barcode generation failed";
        RuntimeException cause = null;

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message, cause);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with empty message")
    void testBarcodeGenerationException_WithEmptyMessage() {
        // Given
        String message = "";

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message);

        // Then
        assertNotNull(exception);
        assertEquals("", exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    @DisplayName("Should create BarcodeGenerationException with empty message and cause")
    void testBarcodeGenerationException_WithEmptyMessageAndCause() {
        // Given
        String message = "";
        RuntimeException cause = new RuntimeException("Network error");

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message, cause);

        // Then
        assertNotNull(exception);
        assertEquals("", exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    @DisplayName("Should verify ProductNotFoundException is RuntimeException")
    void testProductNotFoundException_IsRuntimeException() {
        // Given
        String message = "Test message";

        // When
        ProductNotFoundException exception = new ProductNotFoundException(message);

        // Then
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    @DisplayName("Should verify BarcodeGenerationException is RuntimeException")
    void testBarcodeGenerationException_IsRuntimeException() {
        // Given
        String message = "Test message";

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message);

        // Then
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    @DisplayName("Should handle chained exceptions in BarcodeGenerationException")
    void testBarcodeGenerationException_ChainedExceptions() {
        // Given
        String message = "Barcode generation failed";
        RuntimeException cause1 = new RuntimeException("Network error");
        RuntimeException cause2 = new RuntimeException("Service unavailable", cause1);

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message, cause2);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
        assertEquals(cause2, exception.getCause());
        assertEquals(cause1, exception.getCause().getCause());
    }

    @Test
    @DisplayName("Should handle long error messages")
    void testProductNotFoundException_LongMessage() {
        // Given
        String longMessage = "This is a very long error message that contains detailed information about why the product was not found, including all the search criteria that were used and the specific conditions that led to this failure";

        // When
        ProductNotFoundException exception = new ProductNotFoundException(longMessage);

        // Then
        assertNotNull(exception);
        assertEquals(longMessage, exception.getMessage());
    }

    @Test
    @DisplayName("Should handle special characters in error messages")
    void testBarcodeGenerationException_SpecialCharacters() {
        // Given
        String message = "Barcode generation failed: Invalid characters: @#$%^&*()";

        // When
        BarcodeGenerationException exception = new BarcodeGenerationException(message);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should handle unicode characters in error messages")
    void testProductNotFoundException_UnicodeCharacters() {
        // Given
        String message = "Product not found: 产品未找到";

        // When
        ProductNotFoundException exception = new ProductNotFoundException(message);

        // Then
        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }
}
