package com.example.productservice.exception;

public class BarcodeGenerationException extends RuntimeException {
    public BarcodeGenerationException(String message) {
        super(message);
    }
    
    public BarcodeGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}

