# Kafka VM Deployment Script for Google Cloud Platform (PowerShell)
# This script creates a VM instance and deploys Kafka with Zookeeper

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [string]$Zone = "us-central1-a",
    [string]$VmName = "kafka-server",
    [string]$MachineType = "e2-medium",
    [string]$DiskSize = "50GB"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Kafka VM deployment..." -ForegroundColor Green

# Create firewall rules for Kafka
Write-Host "📝 Creating firewall rules..." -ForegroundColor Yellow
try {
    gcloud compute firewall-rules create kafka-server-ports `
        --allow tcp:9092,tcp:2181,tcp:8088 `
        --source-ranges 0.0.0.0/0 `
        --target-tags kafka-server `
        --description "Allow Kafka, Zookeeper, and Kafka UI ports" `
        --project $ProjectId
} catch {
    Write-Host "Firewall rule may already exist" -ForegroundColor Yellow
}

# Create the VM instance
Write-Host "🖥️ Creating VM instance..." -ForegroundColor Yellow
gcloud compute instances create $VmName `
    --project=$ProjectId `
    --zone=$Zone `
    --machine-type=$MachineType `
    --network-interface=network-tier=PREMIUM,subnet=default `
    --maintenance-policy=MIGRATE `
    --provisioning-model=STANDARD `
    --tags=kafka-server `
    --create-disk=auto-delete=yes,boot=yes,device-name=$VmName,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts,mode=rw,size=$DiskSize,type=projects/$ProjectId/zones/$Zone/diskTypes/pd-balanced `
    --no-shielded-secure-boot `
    --shielded-vtpm `
    --shielded-integrity-monitoring `
    --labels=environment=production,component=kafka `
    --reservation-affinity=any

Write-Host "⏳ Waiting for VM to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Get the external IP
$ExternalIp = gcloud compute instances describe $VmName --zone=$Zone --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
$InternalIp = gcloud compute instances describe $VmName --zone=$Zone --format='get(networkInterfaces[0].networkIP)'

Write-Host "🌍 VM External IP: $ExternalIp" -ForegroundColor Cyan
Write-Host "🏠 VM Internal IP: $InternalIp" -ForegroundColor Cyan

# Copy setup script to VM
Write-Host "📋 Copying setup script to VM..." -ForegroundColor Yellow
gcloud compute scp .\setup-kafka.sh ${VmName}:~/setup-kafka.sh --zone=$Zone
gcloud compute scp .\docker-compose-gcp.yml ${VmName}:~/docker-compose.yml --zone=$Zone

# Execute setup script on VM
Write-Host "🔧 Setting up Kafka on VM..." -ForegroundColor Yellow
gcloud compute ssh $VmName --zone=$Zone --command="chmod +x ~/setup-kafka.sh; ~/setup-kafka.sh $ExternalIp"

Write-Host "✅ Kafka deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Connection Details:" -ForegroundColor Cyan
Write-Host "   Kafka Bootstrap Servers: ${ExternalIp}:9092" -ForegroundColor White
Write-Host "   Zookeeper: ${ExternalIp}:2181" -ForegroundColor White
Write-Host "   Kafka UI: http://${ExternalIp}:8088" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your Spring Boot services to use: ${ExternalIp}:9092" -ForegroundColor White
Write-Host "2. Test connection using the provided test scripts" -ForegroundColor White
Write-Host ""

# Save connection details to file
$connectionDetails = "Kafka VM Connection Details`n"
$connectionDetails += "==========================`n"
$connectionDetails += "VM Name: $VmName`n"
$connectionDetails += "External IP: $ExternalIp`n"
$connectionDetails += "Internal IP: $InternalIp`n"
$connectionDetails += "Zone: $Zone`n`n"
$connectionDetails += "Connection URLs:`n"
$connectionDetails += "Kafka Bootstrap Servers: ${ExternalIp}:9092`n"
$connectionDetails += "Zookeeper: ${ExternalIp}:2181`n"
$connectionDetails += "Kafka UI: http://${ExternalIp}:8088`n`n"
$connectionDetails += "For Spring Boot services, use:`n"
$connectionDetails += "spring.kafka.bootstrap-servers=${ExternalIp}:9092"

$connectionDetails | Out-File -FilePath "kafka-connection-details.txt" -Encoding UTF8

Write-Host "Connection details saved to kafka-connection-details.txt" -ForegroundColor Green