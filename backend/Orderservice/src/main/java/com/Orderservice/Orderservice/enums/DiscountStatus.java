package com.Orderservice.Orderservice.enums;

public enum DiscountStatus {
    ACTIVE,    // Discount is active and can be used
    INACTIVE,  // Discount is temporarily disabled
    EXPIRED,   // Discount has expired
    EXHAUSTED  // Discount usage limit has been reached
}