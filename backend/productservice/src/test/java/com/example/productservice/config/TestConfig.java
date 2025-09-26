package com.example.productservice.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import com.example.productservice.service.BarcodeService;

import static org.mockito.Mockito.*;

/**
 * Test configuration for mocking external services
 */
@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public BarcodeService mockBarcodeService() {
        BarcodeService mockBarcodeService = mock(BarcodeService.class);
        
        // Mock successful barcode generation
        when(mockBarcodeService.generateAndUploadBarcode(anyString()))
            .thenReturn("https://test-cloudinary.com/test-barcode.png");
        
        return mockBarcodeService;
    }
}
