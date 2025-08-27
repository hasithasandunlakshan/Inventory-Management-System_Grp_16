# Test Kafka Setup Script
Write-Host "🧪 Testing Kafka Setup..." -ForegroundColor Green
Write-Host ""

# Test Docker
Write-Host "1. Testing Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not found or not running" -ForegroundColor Red
    exit 1
}

# Test Docker Compose
Write-Host "2. Testing Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "   ✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Check running containers
Write-Host "3. Checking Kafka containers..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String -Pattern "(kafka|zookeeper|kafka-ui)"
if ($containers) {
    Write-Host "   ✅ Running containers:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "      $_" -ForegroundColor Cyan }
} else {
    Write-Host "   ⚠️  No Kafka containers running. Run 'start-kafka.bat' first." -ForegroundColor Yellow
}

# Test Kafka connection
Write-Host "4. Testing Kafka connection..." -ForegroundColor Yellow
try {
    $topics = docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list 2>$null
    if ($topics) {
        Write-Host "   ✅ Kafka is accessible. Topics:" -ForegroundColor Green
        $topics | ForEach-Object { Write-Host "      - $_" -ForegroundColor Cyan }
    } else {
        Write-Host "   ⚠️  Kafka accessible but no topics found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Cannot connect to Kafka" -ForegroundColor Red
}

# Test service endpoints
Write-Host "5. Testing service endpoints..." -ForegroundColor Yellow

# Test Product Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/api/products" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Product Service (8083): Accessible" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Product Service (8083): Not running" -ForegroundColor Yellow
}

# Test Kafka UI
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Kafka UI (8080): Accessible" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Kafka UI (8080): Not accessible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Quick Access URLs:" -ForegroundColor Green
Write-Host "   • Kafka UI: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   • Product Service: http://localhost:8083/api/products" -ForegroundColor Cyan
Write-Host "   • Order Service: http://localhost:8084" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Green
Write-Host "   • Start Kafka: .\start-kafka.bat" -ForegroundColor Cyan
Write-Host "   • Stop Kafka: .\stop-kafka.bat" -ForegroundColor Cyan
Write-Host "   • View logs: docker logs kafka" -ForegroundColor Cyan
Write-Host "   • List topics: docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list" -ForegroundColor Cyan

Write-Host ""
Read-Host "Press Enter to exit"
