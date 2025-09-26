package com.Orderservice.Orderservice.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AllOrdersResponse {
    private boolean success;
    private String message;
    private List<OrderDetailResponse> orders;
    private int totalOrders;
    
    // Pagination metadata
    private PaginationInfo pagination;
    
    @Data
    @Builder
    public static class PaginationInfo {
        private int currentPage;      // 0-based page number
        private int pageSize;         // Number of items per page
        private long totalElements;   // Total number of elements across all pages
        private int totalPages;       // Total number of pages
        private boolean hasNext;      // Whether there's a next page
        private boolean hasPrevious;  // Whether there's a previous page
        private boolean isFirst;      // Whether this is the first page
        private boolean isLast;       // Whether this is the last page
    }
}