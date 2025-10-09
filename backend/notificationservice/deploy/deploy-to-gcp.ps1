# PowerShell Deployment Script for Notification Service on Google Cloud VM
# Project: api-gateway-474511

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$Zone = "us-central1-a",
    [string]$VmName = "notification-service-vm",
    [string]$MachineType = "e2-medium",
    [string]$ServicePort = "8087"
)

Write-Host "Starting Notification Service deployment to Google Cloud VM..." -ForegroundColor Green

try {
    # Build the JAR file locally first
    Write-Host "Building the application..." -ForegroundColor Yellow
    .\mvnw.cmd clean package -DskipTests
    
    if (-not (Test-Path "target\notificationservice-0.0.1-SNAPSHOT.jar")) {
        throw "JAR file not found. Build failed."
    }

    # Create VM instance
    Write-Host "Creating VM instance: $VmName..." -ForegroundColor Yellow
    gcloud compute instances create $VmName `
        --project=$ProjectId `
        --zone=$Zone `
        --machine-type=$MachineType `
        --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default `
        --maintenance-policy=MIGRATE `
        --provisioning-model=STANDARD `
        --service-account=default `
        --scopes=https://www.googleapis.com/auth/cloud-platform `
        --create-disk=auto-delete=yes,boot=yes,device-name=$VmName,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts,mode=rw,size=20,type=projects/$ProjectId/zones/$Zone/diskTypes/pd-standard `
        --no-shielded-secure-boot `
        --shielded-vtpm `
        --shielded-integrity-monitoring `
        --labels=environment=production,service=notification `
        --reservation-affinity=any `
        --tags=notification-service

    # Create firewall rule for the service
    Write-Host "Creating firewall rule..." -ForegroundColor Yellow
    try {
        gcloud compute firewall-rules create allow-notification-service `
            --project=$ProjectId `
            --direction=INGRESS `
            --priority=1000 `
            --network=default `
            --action=ALLOW `
            --rules=tcp:$ServicePort `
            --source-ranges=0.0.0.0/0 `
            --target-tags=notification-service
    }
    catch {
        Write-Host "Firewall rule might already exist, continuing..." -ForegroundColor Yellow
    }

    # Wait for VM to be ready
    Write-Host "Waiting for VM to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    # Get VM external IP
    $ExternalIp = gcloud compute instances describe $VmName --zone=$Zone --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
    Write-Host "VM External IP: $ExternalIp" -ForegroundColor Cyan

    # Copy files to VM
    Write-Host "Copying application files to VM..." -ForegroundColor Yellow
    gcloud compute scp target\notificationservice-0.0.1-SNAPSHOT.jar ${VmName}:~/app.jar --zone=$Zone
    gcloud compute scp deploy\setup-vm.sh ${VmName}:~/setup-vm.sh --zone=$Zone
    gcloud compute scp deploy\notification-service.service ${VmName}:~/notification-service.service --zone=$Zone

    # Setup VM
    Write-Host "Setting up VM..." -ForegroundColor Yellow
    gcloud compute ssh $VmName --zone=$Zone --command="chmod +x ~/setup-vm.sh && ~/setup-vm.sh"

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "VM Name: $VmName" -ForegroundColor Cyan
    Write-Host "External IP: $ExternalIp" -ForegroundColor Cyan
    Write-Host "Zone: $Zone" -ForegroundColor Cyan
    Write-Host "Service URL: http://${ExternalIp}:${ServicePort}" -ForegroundColor Cyan
    Write-Host "Health Check: http://${ExternalIp}:${ServicePort}/health" -ForegroundColor Cyan
    Write-Host "WebSocket Test: http://${ExternalIp}:${ServicePort}/websocket-test.html" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Green
    
    # Test the deployment
    Write-Host "Testing deployment in 30 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    try {
        $response = Invoke-RestMethod -Uri "http://${ExternalIp}:${ServicePort}/health" -Method Get -TimeoutSec 10
        Write-Host "Health check successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "Health check failed. Service might still be starting up." -ForegroundColor Yellow
        Write-Host "Please wait a few more minutes and try: http://${ExternalIp}:${ServicePort}/health" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
}