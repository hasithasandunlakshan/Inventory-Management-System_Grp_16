# Service Configuration Update Script (PowerShell)
# This script updates all microservices to use the deployed Kafka instance

param(
    [Parameter(Mandatory=$true)]
    [string]$KafkaServerIp
)

Write-Host "🔧 Updating microservices to use Kafka server: $KafkaServerIp" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Gray

$BaseDir = "..\backend"

# Function to update application.properties
function Update-ServiceConfig {
    param(
        [string]$ServiceName
    )
    
    $ServicePath = "$BaseDir\$ServiceName\src\main\resources\application.properties"
    
    if (Test-Path $ServicePath) {
        Write-Host "📝 Updating $ServiceName..." -ForegroundColor Yellow
        
        # Backup original file
        Copy-Item $ServicePath "$ServicePath.backup" -Force
        
        # Read file content
        $content = Get-Content $ServicePath -Raw
        
        # Update Kafka bootstrap servers
        $content = $content -replace "spring\.kafka\.bootstrap-servers=localhost:9092", "spring.kafka.bootstrap-servers=$KafkaServerIp:9092"
        $content = $content -replace "spring\.kafka\.bootstrap-servers=localhost:9092", "spring.kafka.bootstrap-servers=$KafkaServerIp:9092"
        
        # Write updated content back
        Set-Content -Path $ServicePath -Value $content -NoNewline
        
        Write-Host "  ✅ Updated $ServiceName configuration" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Configuration file not found for $ServiceName" -ForegroundColor Yellow
    }
}

# Update all services
Write-Host "🔄 Updating service configurations..." -ForegroundColor Cyan

Update-ServiceConfig "Orderservice"
Update-ServiceConfig "productservice"
Update-ServiceConfig "notificationservice"
Update-ServiceConfig "resourseservice"
Update-ServiceConfig "userservice"

# Update docker-compose files if they exist
Write-Host ""
Write-Host "🐳 Updating Docker Compose configurations..." -ForegroundColor Cyan

# Update main docker-compose.yml
$DockerComposeFile = "..\docker-compose.yml"
if (Test-Path $DockerComposeFile) {
    Write-Host "📝 Updating main docker-compose.yml..." -ForegroundColor Yellow
    Copy-Item $DockerComposeFile "$DockerComposeFile.backup" -Force
    
    $content = Get-Content $DockerComposeFile -Raw
    $content = $content -replace "KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092", "KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://$KafkaServerIp:9092"
    Set-Content -Path $DockerComposeFile -Value $content -NoNewline
    
    Write-Host "  ✅ Updated main docker-compose.yml" -ForegroundColor Green
}

# Update user service docker-compose
$UserServiceDocker = "..\backend\userservice\docker-compose.yml"
if (Test-Path $UserServiceDocker) {
    Write-Host "📝 Updating userservice docker-compose.yml..." -ForegroundColor Yellow
    Copy-Item $UserServiceDocker "$UserServiceDocker.backup" -Force
    
    $content = Get-Content $UserServiceDocker -Raw
    $content = $content -replace "SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092", "SPRING_KAFKA_BOOTSTRAP_SERVERS=$KafkaServerIp:9092"
    Set-Content -Path $UserServiceDocker -Value $content -NoNewline
    
    Write-Host "  ✅ Updated userservice docker-compose.yml" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Configuration update completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "  - Updated Kafka bootstrap servers to: ${KafkaServerIp}:9092" -ForegroundColor White
Write-Host "  - Created backup files with .backup extension" -ForegroundColor White  
Write-Host "  - Updated application.properties for all services" -ForegroundColor White
Write-Host "  - Updated Docker Compose files" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Rebuild your Docker images with the new configuration" -ForegroundColor White
Write-Host "2. Redeploy your services to Cloud Run" -ForegroundColor White
Write-Host "3. Test the Kafka connectivity using: .\test-kafka-connection.ps1 $KafkaServerIp" -ForegroundColor White
Write-Host ""
Write-Host "📝 Example rebuild commands:" -ForegroundColor Cyan
Write-Host "   cd ..\backend\Orderservice; docker build -t orderservice:latest ." -ForegroundColor White
Write-Host "   cd ..\backend\productservice; docker build -t productservice:latest ." -ForegroundColor White
Write-Host "   # ... repeat for other services" -ForegroundColor White