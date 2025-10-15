# Google Cloud VM Deployment Script for Order Service (PowerShell)
# This script creates a VM instance and deploys the Order Service to it

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$VMName = "orderservice-vm",
    [string]$Zone = "us-central1-a",
    [string]$MachineType = "e2-medium",
    [string]$ImageFamily = "ubuntu-2204-lts",
    [string]$ImageProject = "ubuntu-os-cloud",
    [string]$ServicePort = "8084"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment of Order Service to Google Cloud VM" -ForegroundColor Blue
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "VM Name: $VMName" -ForegroundColor Cyan
Write-Host "Zone: $Zone" -ForegroundColor Cyan
Write-Host "Machine Type: $MachineType" -ForegroundColor Cyan

# Check if gcloud is installed
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow
try {
    gcloud --version | Out-Null
    Write-Host "SUCCESS: gcloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "`nSetting up Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "`nEnabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable compute.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com

# Check if VM already exists
Write-Host "`nChecking if VM already exists..." -ForegroundColor Yellow
$vmExists = gcloud compute instances list --filter="name=$VMName AND zone:$Zone" --format="value(name)" 2>$null

if ($vmExists) {
    Write-Host "WARNING: VM '$VMName' already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to delete and recreate it? (yes/no)"
    if ($response -eq "yes") {
        Write-Host "Deleting existing VM..." -ForegroundColor Yellow
        gcloud compute instances delete $VMName --zone=$Zone --quiet
        Start-Sleep -Seconds 5
    } else {
        Write-Host "INFO: Proceeding with existing VM..." -ForegroundColor Cyan
        $skipCreation = $true
    }
}

# Create startup script
Write-Host "`nCreating startup script..." -ForegroundColor Yellow
$startupScript = @"
#!/bin/bash
set -e

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Java 17
echo "Installing Java 17..."
apt-get install -y openjdk-17-jdk

# Install Maven
echo "Installing Maven..."
apt-get install -y maven

# Install Git
echo "Installing Git..."
apt-get install -y git

# Install Docker (optional, for containerized deployment)
echo "Installing Docker..."
apt-get install -y docker.io
systemctl start docker
systemctl enable docker

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/orderservice
cd /opt/orderservice

# Create application user
echo "Creating application user..."
useradd -r -s /bin/false orderservice || true

# Create systemd service file
cat > /etc/systemd/system/orderservice.service <<'EOF'
[Unit]
Description=Order Service
After=network.target

[Service]
Type=simple
User=orderservice
WorkingDirectory=/opt/orderservice
ExecStart=/usr/bin/java -jar /opt/orderservice/orderservice.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# Environment variables
Environment="SERVER_PORT=8084"
Environment="SPRING_PROFILES_ACTIVE=cloud"
Environment="SPRING_DATASOURCE_URL=jdbc:mysql://avnadmin:AVNS_Ipqzq0kuyRjWpAdm_pc@mysql-38838f7f-sem5-project.f.aivencloud.com:27040/InventoryManagement?ssl-mode=REQUIRED"
Environment="SPRING_DATASOURCE_USERNAME=avnadmin"
Environment="SPRING_DATASOURCE_PASSWORD=AVNS_Ipqzq0kuyRjWpAdm_pc"
Environment="SPRING_KAFKA_BOOTSTRAP_SERVERS=34.16.102.169:9092"
Environment="SPRING_KAFKA_CONSUMER_GROUP_ID=order-service-group"
Environment="USER_SERVICE_URL=https://userservice-337812374841.us-central1.run.app"
Environment="STRIPE_SECRET_KEY=sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR"
Environment="STRIPE_API_KEY=sk_test_51RruEkCMSVvAbN0Rd6H8EBCbzMQ7E3RXK7Icea1YwqlZncUXhCN1paovgMSTIFdnKiE3MwEWiA6cIRbcRXB2uTiE00JAGGuoSR"

[Install]
WantedBy=multi-user.target
EOF

# Set up logging
mkdir -p /var/log/orderservice
chown orderservice:orderservice /var/log/orderservice

echo "Startup script completed successfully!"
"@

$startupScriptPath = Join-Path $env:TEMP "startup-script.sh"
$startupScript | Out-File -FilePath $startupScriptPath -Encoding UTF8

# Create firewall rule
Write-Host "`nCreating firewall rule..." -ForegroundColor Yellow
$firewallExists = gcloud compute firewall-rules list --filter="name=allow-orderservice" --format="value(name)" 2>$null
if (-not $firewallExists) {
    gcloud compute firewall-rules create allow-orderservice `
        --allow tcp:$ServicePort `
        --source-ranges 0.0.0.0/0 `
        --target-tags orderservice `
        --description "Allow traffic to Order Service on port $ServicePort"
    Write-Host "SUCCESS: Firewall rule created" -ForegroundColor Green
} else {
    Write-Host "INFO: Firewall rule already exists" -ForegroundColor Cyan
}

# Create VM instance
if (-not $skipCreation) {
    Write-Host "`nCreating VM instance..." -ForegroundColor Yellow
    gcloud compute instances create $VMName `
        --zone=$Zone `
        --machine-type=$MachineType `
        --image-family=$ImageFamily `
        --image-project=$ImageProject `
        --boot-disk-size=20GB `
        --boot-disk-type=pd-standard `
        --tags=orderservice `
        --metadata-from-file startup-script=$startupScriptPath `
        --scopes=cloud-platform
    
    Write-Host "SUCCESS: VM instance created successfully" -ForegroundColor Green
    Write-Host "Waiting for VM to start up (this may take a few minutes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
}

# Get VM external IP
Write-Host "`nGetting VM external IP..." -ForegroundColor Yellow
$externalIp = gcloud compute instances describe $VMName --zone=$Zone --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
Write-Host "VM External IP: $externalIp" -ForegroundColor Cyan

# Build the application locally
Write-Host "`nBuilding application locally..." -ForegroundColor Yellow
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd clean package -DskipTests
} else {
    mvn clean package -DskipTests
}

# Check if JAR file was created
$jarFile = Get-ChildItem -Path ".\target\*.jar" | Where-Object { $_.Name -notlike "*-sources.jar" } | Select-Object -First 1
if (-not $jarFile) {
    Write-Host "ERROR: JAR file not found in target directory" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Application built successfully: $($jarFile.Name)" -ForegroundColor Green

# Copy JAR file to VM
Write-Host "`nCopying JAR file to VM..." -ForegroundColor Yellow
gcloud compute scp $jarFile.FullName "${VMName}:/tmp/orderservice.jar" --zone=$Zone

# Deploy application on VM
Write-Host "`nDeploying application on VM..." -ForegroundColor Yellow
gcloud compute ssh $VMName --zone=$Zone --command="sudo mv /tmp/orderservice.jar /opt/orderservice/orderservice.jar"
gcloud compute ssh $VMName --zone=$Zone --command="sudo chown orderservice:orderservice /opt/orderservice/orderservice.jar"
gcloud compute ssh $VMName --zone=$Zone --command="sudo chmod 644 /opt/orderservice/orderservice.jar"
gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl daemon-reload"
gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl enable orderservice"
gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl restart orderservice"

Write-Host "`nWaiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service status
Write-Host "`nChecking service status..." -ForegroundColor Yellow
$status = gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl status orderservice --no-pager" 2>&1

Write-Host "`nService Status:" -ForegroundColor Cyan
Write-Host $status

# Display connection information
Write-Host "`nDEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "`nConnection Information:" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "VM Name:       $VMName" -ForegroundColor Cyan
Write-Host "Zone:          $Zone" -ForegroundColor Cyan
Write-Host "External IP:   $externalIp" -ForegroundColor Cyan
Write-Host "Service Port:  $ServicePort" -ForegroundColor Cyan
Write-Host "Service URL:   http://${externalIp}:${ServicePort}" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "View logs:     gcloud compute ssh $VMName --zone=$Zone --command='sudo journalctl -u orderservice -f'" -ForegroundColor White
Write-Host "Restart:       gcloud compute ssh $VMName --zone=$Zone --command='sudo systemctl restart orderservice'" -ForegroundColor White
Write-Host "Stop:          gcloud compute ssh $VMName --zone=$Zone --command='sudo systemctl stop orderservice'" -ForegroundColor White
Write-Host "SSH to VM:     gcloud compute ssh $VMName --zone=$Zone" -ForegroundColor White
Write-Host "Delete VM:     gcloud compute instances delete $VMName --zone=$Zone" -ForegroundColor White

Write-Host "`nTest the service:" -ForegroundColor Yellow
Write-Host "curl http://${externalIp}:${ServicePort}/actuator/health" -ForegroundColor White

# Clean up
Remove-Item $startupScriptPath -ErrorAction SilentlyContinue
