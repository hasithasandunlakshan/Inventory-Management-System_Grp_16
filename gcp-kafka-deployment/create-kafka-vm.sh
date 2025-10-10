#!/bin/bash

# Kafka VM Deployment Script for Google Cloud Platform
# This script creates a VM instance and deploys Kafka with Zookeeper

set -e

# Configuration variables
PROJECT_ID="api-gateway-474511"  # Your actual project ID
ZONE="us-central1-a"          # Change if needed
VM_NAME="kafka-server"
MACHINE_TYPE="e2-medium"      # Adjust based on your needs
DISK_SIZE="50GB"
NETWORK_TAG="kafka-server"

echo "🚀 Starting Kafka VM deployment..."

# Create firewall rules for Kafka
echo "📝 Creating firewall rules..."
gcloud compute firewall-rules create kafka-server-ports \
    --allow tcp:9092,tcp:2181,tcp:8088 \
    --source-ranges 0.0.0.0/0 \
    --target-tags kafka-server \
    --description "Allow Kafka, Zookeeper, and Kafka UI ports" \
    --project $PROJECT_ID || echo "Firewall rule may already exist"

# Create the VM instance
echo "🖥️ Creating VM instance..."
gcloud compute instances create $VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --tags=$NETWORK_TAG \
    --create-disk=auto-delete=yes,boot=yes,device-name=$VM_NAME,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts,mode=rw,size=$DISK_SIZE,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-balanced \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=environment=production,component=kafka \
    --reservation-affinity=any

echo "⏳ Waiting for VM to be ready..."
sleep 30

# Get the external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
INTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].networkIP)')

echo "🌍 VM External IP: $EXTERNAL_IP"
echo "🏠 VM Internal IP: $INTERNAL_IP"

# Copy setup script to VM
echo "📋 Copying setup script to VM..."
gcloud compute scp ./setup-kafka.sh $VM_NAME:~/setup-kafka.sh --zone=$ZONE

# Copy docker-compose file to VM
gcloud compute scp ./docker-compose-gcp.yml $VM_NAME:~/docker-compose.yml --zone=$ZONE

# Execute setup script on VM
echo "🔧 Setting up Kafka on VM..."
gcloud compute ssh $VM_NAME --zone=$ZONE --command="chmod +x ~/setup-kafka.sh && ~/setup-kafka.sh $EXTERNAL_IP"

echo "✅ Kafka deployment completed!"
echo ""
echo "📋 Connection Details:"
echo "   Kafka Bootstrap Servers: $EXTERNAL_IP:9092"
echo "   Zookeeper: $EXTERNAL_IP:2181"
echo "   Kafka UI: http://$EXTERNAL_IP:8088"
echo ""
echo "🔧 Next steps:"
echo "1. Update your Spring Boot services to use: $EXTERNAL_IP:9092"
echo "2. Test connection using the provided test scripts"
echo ""

# Save connection details to file
cat > kafka-connection-details.txt << EOF
Kafka VM Connection Details
==========================
VM Name: $VM_NAME
External IP: $EXTERNAL_IP
Internal IP: $INTERNAL_IP
Zone: $ZONE

Connection URLs:
- Kafka Bootstrap Servers: $EXTERNAL_IP:9092
- Zookeeper: $EXTERNAL_IP:2181
- Kafka UI: http://$EXTERNAL_IP:8088

For Spring Boot services, use:
spring.kafka.bootstrap-servers=$EXTERNAL_IP:9092
EOF

echo "💾 Connection details saved to kafka-connection-details.txt"