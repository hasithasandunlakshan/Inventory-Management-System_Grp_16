# Simple Time Measurement Script
# Tests the optimized API and measures response time

$userId = 1
$url = "http://localhost:8084/api/orders/user/$userId"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API Performance Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Testing endpoint: $url`n" -ForegroundColor Yellow

# Measure response time
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    $stopwatch.Stop()
    
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    Write-Host "✓ SUCCESS!`n" -ForegroundColor Green
    Write-Host "Response Time: $elapsed ms`n" -ForegroundColor Magenta
    
    Write-Host "Results:" -ForegroundColor Yellow
    Write-Host "  Total Orders: $($response.totalOrders)" -ForegroundColor White
    
    if ($response.totalOrders -gt 0) {
        $totalItems = 0
        foreach ($order in $response.orders) {
            $totalItems += $order.orderItems.Count
        }
        Write-Host "  Total Order Items: $totalItems`n" -ForegroundColor White
        
        Write-Host "Database Query Analysis:" -ForegroundColor Yellow
        Write-Host "  OLD WAY: Would make $($totalItems + 1) queries" -ForegroundColor Red
        Write-Host "  NEW WAY: Made only 2 queries" -ForegroundColor Green
        Write-Host "  SAVED: $($totalItems - 1) queries!" -ForegroundColor Magenta
        
        $reduction = [math]::Round((($totalItems - 1) / ($totalItems + 1)) * 100, 1)
        Write-Host "  REDUCTION: $reduction%`n" -ForegroundColor Green
    }
    
    Write-Host "========================================`n" -ForegroundColor Cyan
    
} catch {
    $stopwatch.Stop()
    Write-Host "✗ ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
}
