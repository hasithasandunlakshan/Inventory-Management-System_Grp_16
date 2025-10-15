# Test Actuator Endpoints
# This script tests if the actuator endpoints are working

$VM_IP = gcloud compute instances describe orderservice-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)' 2>$null

if (-not $VM_IP) {
    Write-Host "ERROR: Could not get VM IP. Is the VM running?" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Order Service Actuator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VM IP: $VM_IP" -ForegroundColor Yellow
Write-Host "Port: 8084" -ForegroundColor Yellow
Write-Host ""

# Test health endpoint
Write-Host "Testing /actuator/health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://${VM_IP}:8084/actuator/health" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: Health endpoint is accessible" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "FAILED: Health endpoint not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test main API endpoint
Write-Host "Testing /api/orders/count/confirmed..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "http://${VM_IP}:8084/api/orders/count/confirmed" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: API endpoint is accessible" -ForegroundColor Green
    $apiResponse | ConvertTo-Json
} catch {
    Write-Host "FAILED: API endpoint not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Available Endpoints:" -ForegroundColor Cyan
Write-Host "Health Check: http://${VM_IP}:8084/actuator/health" -ForegroundColor White
Write-Host "Orders API: http://${VM_IP}:8084/api/orders/all" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
