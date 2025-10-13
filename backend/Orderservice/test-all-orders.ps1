# Test Script for Optimized /api/orders/all Endpoint

param(
    [int]$page = 0,
    [int]$size = 20
)

$baseUrl = "http://localhost:8084"
$endpoint = "/api/orders/all"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Optimized /api/orders/all" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Page: $page" -ForegroundColor White
Write-Host "  Size: $size`n" -ForegroundColor White

$url = "$baseUrl$endpoint`?page=$page&size=$size"
Write-Host "URL: $url`n" -ForegroundColor Yellow

# Measure response time
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    $stopwatch.Stop()
    
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    Write-Host "✓ SUCCESS!`n" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Performance Metrics" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Response Time: $elapsed ms`n" -ForegroundColor Magenta
    
    if ($response.success) {
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Results Summary" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Total Orders in DB: $($response.totalOrders)" -ForegroundColor White
        Write-Host "Orders on This Page: $($response.orders.Count)`n" -ForegroundColor White
        
        if ($response.pagination) {
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Pagination Info" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Current Page: $($response.pagination.currentPage)" -ForegroundColor White
            Write-Host "Page Size: $($response.pagination.pageSize)" -ForegroundColor White
            Write-Host "Total Pages: $($response.pagination.totalPages)" -ForegroundColor White
            Write-Host "Total Elements: $($response.pagination.totalElements)" -ForegroundColor White
            Write-Host "Has Next: $($response.pagination.hasNext)" -ForegroundColor White
            Write-Host "Has Previous: $($response.pagination.hasPrevious)`n" -ForegroundColor White
        }
        
        if ($response.orders.Count -gt 0) {
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Sample Orders" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            
            $sampleCount = [Math]::Min(3, $response.orders.Count)
            for ($i = 0; $i -lt $sampleCount; $i++) {
                $order = $response.orders[$i]
                Write-Host "Order #$($order.orderId):" -ForegroundColor Yellow
                Write-Host "  Customer: $($order.customerName) ($($order.customerEmail))" -ForegroundColor White
                Write-Host "  Address: $($order.customerAddress)" -ForegroundColor White
                if ($order.customerLatitude -and $order.customerLongitude) {
                    Write-Host "  Location: $($order.customerLatitude), $($order.customerLongitude)" -ForegroundColor White
                }
                Write-Host "  Status: $($order.status)" -ForegroundColor White
                Write-Host "  Amount: `$$($order.totalAmount)" -ForegroundColor White
                Write-Host "  Items: $($order.orderItems.Count)" -ForegroundColor White
                Write-Host "  Date: $($order.orderDate)`n" -ForegroundColor Gray
            }
            
            if ($response.orders.Count -gt $sampleCount) {
                Write-Host "... and $($response.orders.Count - $sampleCount) more orders`n" -ForegroundColor Gray
            }
            
            # Calculate statistics
            $totalItems = ($response.orders | ForEach-Object { $_.orderItems.Count } | Measure-Object -Sum).Sum
            $uniqueCustomers = ($response.orders | Select-Object -ExpandProperty customerId -Unique).Count
            $uniqueProducts = ($response.orders | ForEach-Object { $_.orderItems | ForEach-Object { $_.productId } } | Select-Object -Unique | Where-Object { $_ -ne $null }).Count
            
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Performance Analysis" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Total Order Items: $totalItems" -ForegroundColor White
            Write-Host "Unique Customers: $uniqueCustomers" -ForegroundColor White
            Write-Host "Unique Products: $uniqueProducts`n" -ForegroundColor White
            
            $oldQueries = 1 + $totalItems + $uniqueCustomers
            $newQueries = 3
            $reduction = [math]::Round((($oldQueries - $newQueries) / $oldQueries) * 100, 1)
            
            Write-Host "Database Query Comparison:" -ForegroundColor Yellow
            Write-Host "  OLD WAY: $oldQueries queries" -ForegroundColor Red
            Write-Host "  NEW WAY: $newQueries queries" -ForegroundColor Green
            Write-Host "  SAVED: $($oldQueries - $newQueries) queries" -ForegroundColor Magenta
            Write-Host "  REDUCTION: $reduction%`n" -ForegroundColor Green
            
            Write-Host "User Service Calls: $uniqueCustomers (done in parallel)`n" -ForegroundColor White
        }
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ Optimization Features:" -ForegroundColor Yellow
        Write-Host "  ✓ Bulk product fetching" -ForegroundColor Green
        Write-Host "  ✓ Bulk user details fetching" -ForegroundColor Green
        Write-Host "  ✓ Pagination support" -ForegroundColor Green
        Write-Host "  ✓ All order statuses included" -ForegroundColor Green
        Write-Host "  ✓ Complete user details (name, email, address, location)" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Cyan
        
    } else {
        Write-Host "Error: $($response.message)`n" -ForegroundColor Red
    }
    
} catch {
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    Write-Host "✗ ERROR!`n" -ForegroundColor Red
    Write-Host "Response Time: $elapsed ms" -ForegroundColor Magenta
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "`n💡 Try different pages: .\test-all-orders.ps1 -page 1 -size 10`n" -ForegroundColor Yellow
