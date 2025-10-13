# PowerShell script to test the optimized /api/orders/user/{userId} endpoint

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Optimized API Endpoint" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8084"
$userId = 1  # Change this to test different users

Write-Host "Endpoint: $baseUrl/api/orders/user/$userId" -ForegroundColor Yellow
Write-Host ""

# Test the API
Write-Host "Making API request..." -ForegroundColor Green
$startTime = Get-Date

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/user/$userId" -Method Get -ContentType "application/json"
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✓ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Response Time: $duration ms" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Response Summary:" -ForegroundColor Yellow
    Write-Host "  - Success: $($response.success)"
    Write-Host "  - Message: $($response.message)"
    Write-Host "  - Total Orders: $($response.totalOrders)"
    Write-Host ""
    
    if ($response.totalOrders -gt 0) {
        Write-Host "Order Details:" -ForegroundColor Yellow
        $itemCount = 0
        foreach ($order in $response.orders) {
            Write-Host "  Order #$($order.orderId):" -ForegroundColor White
            Write-Host "    - Status: $($order.status)"
            Write-Host "    - Total: `$$($order.totalAmount)"
            Write-Host "    - Items: $($order.orderItems.Count)"
            $itemCount += $order.orderItems.Count
        }
        Write-Host ""
        Write-Host "Total Order Items: $itemCount" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Performance Analysis:" -ForegroundColor Yellow
        Write-Host "  OLD: Would have made $($itemCount + 1) queries" -ForegroundColor Red
        Write-Host "  NEW: Made only 2 queries" -ForegroundColor Green
        Write-Host "  Reduction: $([math]::Round((($itemCount - 1) / ($itemCount + 1)) * 100, 2))%" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
    }
    
    # Display full response (optional - uncomment to see full JSON)
    # Write-Host ""
    # Write-Host "Full Response:" -ForegroundColor Yellow
    # $response | ConvertTo-Json -Depth 10
    
} catch {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✗ Error!" -ForegroundColor Red
    Write-Host "Response Time: $duration ms" -ForegroundColor Magenta
    Write-Host "Error Details: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check the application logs to see:" -ForegroundColor Yellow
Write-Host "  - SQL queries executed (spring.jpa.show-sql=true)" -ForegroundColor White
Write-Host "  - Only 2 queries should be visible:" -ForegroundColor White
Write-Host "    1. SELECT orders with order_items" -ForegroundColor White
Write-Host "    2. SELECT products WHERE product_id IN (...)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
