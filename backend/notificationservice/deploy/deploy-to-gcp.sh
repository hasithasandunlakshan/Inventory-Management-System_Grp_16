#!/bin/bash

# Notification Service Deployment Script for Google Cloud VM
# Project: api-gateway-474511

set -e

echo "Starting Notification Service deployment to Google Cloud VM..."

# Configuration
PROJECT_ID="api-gateway-474511"
ZONE="us-central1-a"
VM_NAME="notification-service-vm"
MACHINE_TYPE="e2-medium"
IMAGE_FAMILY="ubuntu-2004-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
SERVICE_NAME="notification-service"
SERVICE_PORT="8087"

# Build the JAR file locally first
echo "Building the application..."
./mvnw clean package -DskipTests

# Create VM instance
echo "Creating VM instance: $VM_NAME..."
gcloud compute instances create $VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --create-disk=auto-delete=yes,boot=yes,device-name=$VM_NAME,image=projects/$IMAGE_PROJECT/global/images/family/$IMAGE_FAMILY,mode=rw,size=20,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-standard \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=environment=production,service=notification \
    --reservation-affinity=any \
    --tags=notification-service

# Create firewall rule for the service
echo "Creating firewall rule..."
gcloud compute firewall-rules create allow-notification-service \
    --project=$PROJECT_ID \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:$SERVICE_PORT \
    --source-ranges=0.0.0.0/0 \
    --target-tags=notification-service

# Wait for VM to be ready
echo "Waiting for VM to be ready..."
sleep 30

# Get VM external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
echo "VM External IP: $EXTERNAL_IP"

# Copy files to VM
echo "Copying application files to VM..."
gcloud compute scp target/notificationservice-0.0.1-SNAPSHOT.jar $VM_NAME:~/app.jar --zone=$ZONE
gcloud compute scp deploy/setup-vm.sh $VM_NAME:~/setup-vm.sh --zone=$ZONE
gcloud compute scp deploy/notification-service.service $VM_NAME:~/notification-service.service --zone=$ZONE

# Setup VM
echo "Setting up VM..."
gcloud compute ssh $VM_NAME --zone=$ZONE --command="chmod +x ~/setup-vm.sh && ~/setup-vm.sh"

echo "Deployment completed successfully!"
echo "======================================"
echo "VM Name: $VM_NAME"
echo "External IP: $EXTERNAL_IP"
echo "Zone: $ZONE"
echo "Service URL: http://$EXTERNAL_IP:$SERVICE_PORT"
echo "Health Check: http://$EXTERNAL_IP:$SERVICE_PORT/health"
echo "WebSocket Test: http://$EXTERNAL_IP:$SERVICE_PORT/websocket-test.html"
echo "======================================"