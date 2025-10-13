package com.Orderservice.Orderservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllOrdersResponse {
    private boolean success;
    private String message;
    private List<OrderDetailResponse> orders;
    private int totalOrders;
    
    // Pagination metadata
    private PaginationInfo pagination;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaginationInfo {
        private int currentPage;      // 0-based page number
        private int pageSize;         // Number of items per page
        private int totalPages;       // Total number of pages
        private long totalElements;   // Total number of elements across all pages
        private boolean hasNext;      // Whether there's a next page
        private boolean hasPrevious;  // Whether there's a previous page
        private boolean isFirst;      // Whether this is the first page
        private boolean isLast;       // Whether this is the last page
        
        // Convenience constructor for simple cases
        public PaginationInfo(int currentPage, int pageSize, int totalPages, long totalElements) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.totalPages = totalPages;
            this.totalElements = totalElements;
            this.hasNext = currentPage < totalPages - 1;
            this.hasPrevious = currentPage > 0;
            this.isFirst = currentPage == 0;
            this.isLast = currentPage == totalPages - 1 || totalPages == 0;
        }
    }
}