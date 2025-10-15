# Script to update the Order Service on an existing VM
# Use this for quick updates without recreating the VM

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$VMName = "orderservice-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Updating Order Service on VM" -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "VM Name: $VMName" -ForegroundColor Cyan
Write-Host "Zone: $Zone" -ForegroundColor Cyan

# Set project
gcloud config set project $ProjectId

# Build the application
Write-Host "`n🏗️  Building application..." -ForegroundColor Yellow
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd clean package -DskipTests
} else {
    mvn clean package -DskipTests
}

# Find JAR file
$jarFile = Get-ChildItem -Path ".\target\*.jar" | Where-Object { $_.Name -notlike "*-sources.jar" } | Select-Object -First 1
if (-not $jarFile) {
    Write-Host "❌ JAR file not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful: $($jarFile.Name)" -ForegroundColor Green

# Stop the service
Write-Host "`n⏸️  Stopping service..." -ForegroundColor Yellow
gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl stop orderservice"

# Copy new JAR
Write-Host "`n📤 Uploading new version..." -ForegroundColor Yellow
gcloud compute scp $jarFile.FullName "${VMName}:/tmp/orderservice.jar" --zone=$Zone

# Update and restart
Write-Host "`n🔄 Installing and restarting service..." -ForegroundColor Yellow
$updateCommands = @"
sudo mv /tmp/orderservice.jar /opt/orderservice/orderservice.jar
sudo chown orderservice:orderservice /opt/orderservice/orderservice.jar
sudo chmod 644 /opt/orderservice/orderservice.jar
sudo systemctl start orderservice
"@

gcloud compute ssh $VMName --zone=$Zone --command="$updateCommands"

Write-Host "`n⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host "`n🔍 Checking service status..." -ForegroundColor Yellow
$status = gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl status orderservice --no-pager"
Write-Host $status

Write-Host "`n✅ Update completed!" -ForegroundColor Green
