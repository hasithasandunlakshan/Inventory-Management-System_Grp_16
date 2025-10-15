# VM Management Script for Order Service
# Provides common management operations

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'ssh', 'delete', 'info')]
    [string]$Action,
    
    [string]$ProjectId = "api-gateway-474511",
    [string]$VMName = "orderservice-vm",
    [string]$Zone = "us-central1-a"
)

$ErrorActionPreference = "Stop"

# Set project
gcloud config set project $ProjectId

switch ($Action) {
    'start' {
        Write-Host "▶️  Starting VM..." -ForegroundColor Yellow
        gcloud compute instances start $VMName --zone=$Zone
        Write-Host "✅ VM started" -ForegroundColor Green
    }
    
    'stop' {
        Write-Host "⏸️  Stopping VM..." -ForegroundColor Yellow
        gcloud compute instances stop $VMName --zone=$Zone
        Write-Host "✅ VM stopped" -ForegroundColor Green
    }
    
    'restart' {
        Write-Host "🔄 Restarting service..." -ForegroundColor Yellow
        gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl restart orderservice"
        Start-Sleep -Seconds 5
        $status = gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl status orderservice --no-pager"
        Write-Host $status
        Write-Host "✅ Service restarted" -ForegroundColor Green
    }
    
    'status' {
        Write-Host "📊 Checking status..." -ForegroundColor Yellow
        Write-Host "`nVM Status:" -ForegroundColor Cyan
        gcloud compute instances describe $VMName --zone=$Zone --format="table(name,status,networkInterfaces[0].accessConfigs[0].natIP)"
        
        Write-Host "`nService Status:" -ForegroundColor Cyan
        gcloud compute ssh $VMName --zone=$Zone --command="sudo systemctl status orderservice --no-pager"
    }
    
    'ssh' {
        Write-Host "🔐 Connecting to VM..." -ForegroundColor Yellow
        gcloud compute ssh $VMName --zone=$Zone
    }
    
    'delete' {
        Write-Host "⚠️  This will delete the VM permanently!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? Type 'DELETE' to confirm"
        if ($confirm -eq 'DELETE') {
            Write-Host "🗑️  Deleting VM..." -ForegroundColor Yellow
            gcloud compute instances delete $VMName --zone=$Zone --quiet
            Write-Host "✅ VM deleted" -ForegroundColor Green
        } else {
            Write-Host "❌ Deletion cancelled" -ForegroundColor Yellow
        }
    }
    
    'info' {
        Write-Host "📋 VM Information" -ForegroundColor Blue
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
        
        $vmInfo = gcloud compute instances describe $VMName --zone=$Zone --format=json | ConvertFrom-Json
        $externalIp = $vmInfo.networkInterfaces[0].accessConfigs[0].natIP
        
        Write-Host "VM Name:          $VMName" -ForegroundColor Cyan
        Write-Host "Zone:             $Zone" -ForegroundColor Cyan
        Write-Host "Status:           $($vmInfo.status)" -ForegroundColor Cyan
        Write-Host "Machine Type:     $($vmInfo.machineType.Split('/')[-1])" -ForegroundColor Cyan
        Write-Host "External IP:      $externalIp" -ForegroundColor Cyan
        Write-Host "Internal IP:      $($vmInfo.networkInterfaces[0].networkIP)" -ForegroundColor Cyan
        Write-Host "Service URL:      http://${externalIp}:8084" -ForegroundColor Cyan
        Write-Host "Health Check:     http://${externalIp}:8084/actuator/health" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    }
}
