#!/bin/bash

# VM Setup Script for Notification Service

set -e

echo "Setting up Notification Service on VM..."

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Java 17
echo "Installing Java 17..."
sudo apt-get install -y openjdk-17-jdk

# Verify Java installation
java -version

# Create application directory
sudo mkdir -p /opt/notification-service
sudo cp ~/app.jar /opt/notification-service/
sudo chown -R $USER:$USER /opt/notification-service

# Create systemd service
echo "Creating systemd service..."
sudo cp ~/notification-service.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable notification-service

# Start the service
echo "Starting notification service..."
sudo systemctl start notification-service

# Check service status
sudo systemctl status notification-service

# Install monitoring tools
echo "Installing monitoring tools..."
sudo apt-get install -y htop curl

# Display service information
echo "Service setup completed!"
echo "========================"
echo "Service Status:"
sudo systemctl is-active notification-service
echo "Logs location: /var/log/notification-service/"
echo "To view logs: sudo journalctl -u notification-service -f"
echo "To restart: sudo systemctl restart notification-service"
echo "To stop: sudo systemctl stop notification-service"