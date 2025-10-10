# Test Kafka Connection Script (PowerShell)
param(
    [Parameter(Mandatory=$true)]
    [string]$KafkaServer
)

$KafkaEndpoint = "${KafkaServer}:9092"

Write-Host "🧪 Testing Kafka connectivity to $KafkaEndpoint" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Gray

# Test 1: Port connectivity
Write-Host "1️⃣ Testing port connectivity..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ReceiveTimeout = 5000
    $tcpClient.SendTimeout = 5000
    $tcpClient.Connect($KafkaServer, 9092)
    $tcpClient.Close()
    Write-Host "✅ Port 9092 is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Port 9092 is not accessible" -ForegroundColor Red
    Write-Host "   Check firewall rules and VM status" -ForegroundColor Yellow
    exit 1
}

# Test 2: Kafka UI accessibility
Write-Host ""
Write-Host "2️⃣ Testing Kafka UI accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${KafkaServer}:8088" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Kafka UI is accessible at http://${KafkaServer}:8088" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Kafka UI not accessible" -ForegroundColor Yellow
}

# Test 3: Docker availability check
Write-Host ""
Write-Host "3️⃣ Checking Docker availability..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker is available - you can run advanced tests" -ForegroundColor Green
    Write-Host "Run this command to test topic creation:" -ForegroundColor Cyan
    Write-Host "docker run --rm -it confluentinc/cp-kafka:7.4.0 kafka-topics --create --topic test-topic --bootstrap-server ${KafkaEndpoint} --partitions 1 --replication-factor 1" -ForegroundColor White
} else {
    Write-Host "⚠️ Docker not available - install Docker for advanced testing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Connection test completed!" -ForegroundColor Green
Write-Host "Use this connection string in your Spring Boot services:" -ForegroundColor Cyan
Write-Host "spring.kafka.bootstrap-servers=$KafkaEndpoint" -ForegroundColor White