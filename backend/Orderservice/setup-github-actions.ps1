# GitHub Actions CI/CD Setup Script for Google Cloud VM
# This script automates the setup of service account and permissions for GitHub Actions

param(
    [string]$ProjectId = "api-gateway-474511",
    [string]$ServiceAccountName = "github-actions-deployer",
    [string]$VMName = "orderservice-vm",
    [string]$Zone = "us-central1-a",
    [string]$KeyFileName = "github-actions-key.json"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "GitHub Actions CI/CD Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if gcloud is installed
Write-Host "[*] Checking prerequisites..." -ForegroundColor Yellow
try {
    gcloud --version | Out-Null
    Write-Host "[SUCCESS] gcloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Set project
Write-Host "`n[*] Setting up Google Cloud project..." -ForegroundColor Yellow
Write-Host "   Project ID: $ProjectId" -ForegroundColor Cyan
gcloud config set project $ProjectId

# Construct service account email
$ServiceAccountEmail = "${ServiceAccountName}@${ProjectId}.iam.gserviceaccount.com"

# Check if service account already exists
Write-Host "`n[*] Checking if service account exists..." -ForegroundColor Yellow
$existingSA = gcloud iam service-accounts list --filter="email:$ServiceAccountEmail" --format="value(email)" 2>$null

if ($existingSA) {
    Write-Host "[WARNING] Service account already exists: $ServiceAccountEmail" -ForegroundColor Yellow
    $response = Read-Host "Do you want to use the existing service account? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "[ERROR] Setup cancelled by user." -ForegroundColor Red
        exit 1
    }
} else {
    # Create service account
    Write-Host "`n[*] Creating service account..." -ForegroundColor Yellow
    Write-Host "   Name: $ServiceAccountName" -ForegroundColor Cyan
    Write-Host "   Email: $ServiceAccountEmail" -ForegroundColor Cyan
    
    gcloud iam service-accounts create $ServiceAccountName `
        --display-name="GitHub Actions Deployer for Order Service" `
        --description="Service account for GitHub Actions to deploy to VM" `
        --project=$ProjectId
    
    Write-Host "[SUCCESS] Service account created" -ForegroundColor Green
}

# Grant roles
Write-Host "`n[*] Granting IAM roles to service account..." -ForegroundColor Yellow

$roles = @(
    "roles/compute.instanceAdmin.v1",
    "roles/iam.serviceAccountUser",
    "roles/compute.osLogin"
)

foreach ($role in $roles) {
    Write-Host "   Granting $role..." -ForegroundColor Cyan
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:${ServiceAccountEmail}" `
        --role=$role `
        --quiet 2>&1 | Out-Null
}

Write-Host "[SUCCESS] IAM roles granted successfully" -ForegroundColor Green

# Grant VM-specific permissions
Write-Host "`n[*] Granting VM-specific permissions..." -ForegroundColor Yellow

# Check if VM exists
$vmExists = gcloud compute instances list --filter="name=$VMName AND zone:$Zone" --format="value(name)" 2>$null

if ($vmExists) {
    Write-Host "   VM found: $VMName" -ForegroundColor Cyan
    
    # Enable OS Login on the VM
    Write-Host "   Enabling OS Login on VM..." -ForegroundColor Cyan
    gcloud compute instances add-metadata $VMName `
        --zone=$Zone `
        --metadata=enable-oslogin=TRUE `
        --quiet
    
    # Grant OS Admin Login to VM
    Write-Host "   Granting OS Admin Login permission..." -ForegroundColor Cyan
    gcloud compute instances add-iam-policy-binding $VMName `
        --zone=$Zone `
        --member="serviceAccount:${ServiceAccountEmail}" `
        --role="roles/compute.osAdminLogin" `
        --quiet 2>&1 | Out-Null
    
    Write-Host "[SUCCESS] VM permissions configured" -ForegroundColor Green
} else {
    Write-Host "[WARNING] VM '$VMName' not found in zone '$Zone'" -ForegroundColor Yellow
    Write-Host "   VM-specific permissions will need to be configured after VM creation" -ForegroundColor Yellow
}

# Create and download service account key
Write-Host "`n[*] Creating service account key..." -ForegroundColor Yellow

if (Test-Path $KeyFileName) {
    Write-Host "[WARNING] Key file already exists: $KeyFileName" -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "[INFO] Skipping key creation." -ForegroundColor Yellow
        $skipKey = $true
    } else {
        Remove-Item $KeyFileName -Force
    }
}

if (-not $skipKey) {
    gcloud iam service-accounts keys create $KeyFileName `
        --iam-account=$ServiceAccountEmail `
        --project=$ProjectId
    
    Write-Host "[SUCCESS] Service account key created: $KeyFileName" -ForegroundColor Green
}

# Display setup summary
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "[SUCCESS] SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add GitHub Secret:" -ForegroundColor Cyan
Write-Host "   - Go to your GitHub repository" -ForegroundColor White
Write-Host "   - Navigate to: Settings -> Secrets and variables -> Actions" -ForegroundColor White
Write-Host "   - Click 'New repository secret'" -ForegroundColor White
Write-Host "   - Name: GCP_SA_KEY" -ForegroundColor White
Write-Host "   - Value: Copy the entire content of '$KeyFileName'" -ForegroundColor White
Write-Host ""

if (-not $skipKey) {
    Write-Host "2. View the key content:" -ForegroundColor Cyan
    Write-Host "   Get-Content $KeyFileName" -ForegroundColor White
    Write-Host ""
}

Write-Host "3. Secure the key file:" -ForegroundColor Cyan
Write-Host "   [IMPORTANT] Delete the key file after adding to GitHub:" -ForegroundColor Yellow
Write-Host "   Remove-Item $KeyFileName" -ForegroundColor White
Write-Host ""

Write-Host "4. Test the CI/CD pipeline:" -ForegroundColor Cyan
Write-Host "   - Push changes to the main branch" -ForegroundColor White
Write-Host "   - Or manually trigger the workflow from GitHub Actions UI" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Configuration Details" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Project ID:           $ProjectId" -ForegroundColor Cyan
Write-Host "Service Account:      $ServiceAccountEmail" -ForegroundColor Cyan
Write-Host "VM Name:              $VMName" -ForegroundColor Cyan
Write-Host "Zone:                 $Zone" -ForegroundColor Cyan
Write-Host "Key File:             $KeyFileName" -ForegroundColor Cyan
Write-Host ""

# Get VM IP if exists
if ($vmExists) {
    $vmIP = gcloud compute instances describe $VMName `
        --zone=$Zone `
        --format='get(networkInterfaces[0].accessConfigs[0].natIP)' 2>$null
    
    if ($vmIP) {
        Write-Host "VM External IP:       $vmIP" -ForegroundColor Cyan
        Write-Host "Service URL:          http://${vmIP}:8084" -ForegroundColor Cyan
        Write-Host "Health Check:         http://${vmIP}:8084/actuator/health" -ForegroundColor Cyan
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Documentation" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "For detailed instructions, see: CICD_SETUP_GUIDE.md" -ForegroundColor White
Write-Host ""

# Offer to display the key content
if (-not $skipKey -and (Test-Path $KeyFileName)) {
    $response = Read-Host "Do you want to display the key content now? (yes/no)"
    if ($response -eq "yes") {
        Write-Host "`n========================================" -ForegroundColor Blue
        Write-Host "Service Account Key Content" -ForegroundColor Blue
        Write-Host "========================================" -ForegroundColor Blue
        Write-Host "Copy this entire content and paste it as the GCP_SA_KEY secret in GitHub:" -ForegroundColor Yellow
        Write-Host ""
        Get-Content $KeyFileName
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Blue
    }
}

Write-Host "`n[SUCCESS] Setup script completed successfully!" -ForegroundColor Green
Write-Host ""
