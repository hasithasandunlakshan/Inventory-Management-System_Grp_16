# Script to view Order Service logs on VM

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$VMName = "orderservice-vm",
    [string]$Zone = "us-central1-a",
    [switch]$Follow
)

$ErrorActionPreference = "Stop"

gcloud config set project $ProjectId

Write-Host "📋 Viewing Order Service logs..." -ForegroundColor Blue

if ($Follow) {
    Write-Host "Following logs (Press Ctrl+C to stop)..." -ForegroundColor Yellow
    gcloud compute ssh $VMName --zone=$Zone --command="sudo journalctl -u orderservice -f --no-pager"
} else {
    Write-Host "Showing last 100 lines..." -ForegroundColor Yellow
    gcloud compute ssh $VMName --zone=$Zone --command="sudo journalctl -u orderservice -n 100 --no-pager"
}
