@echo off
echo Starting Notification Service deployment to Google Cloud VM...

REM Build the application
echo Building the application...
call mvnw.cmd clean package -DskipTests

if not exist "target\notificationservice-0.0.1-SNAPSHOT.jar" (
    echo Build failed! JAR file not found.
    pause
    exit /b 1
)

REM Set variables
set PROJECT_ID=api-gateway-474511
set ZONE=us-central1-a
set VM_NAME=notification-service-vm
set MACHINE_TYPE=e2-medium
set SERVICE_PORT=8087

echo Creating VM instance: %VM_NAME%...
gcloud compute instances create %VM_NAME% ^
    --project=%PROJECT_ID% ^
    --zone=%ZONE% ^
    --machine-type=%MACHINE_TYPE% ^
    --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default ^
    --maintenance-policy=MIGRATE ^
    --provisioning-model=STANDARD ^
    --service-account=default ^
    --scopes=https://www.googleapis.com/auth/cloud-platform ^
    --create-disk=auto-delete=yes,boot=yes,device-name=%VM_NAME%,image=projects/debian-cloud/global/images/family/debian-12,mode=rw,size=20,type=projects/%PROJECT_ID%/zones/%ZONE%/diskTypes/pd-standard ^
    --no-shielded-secure-boot ^
    --shielded-vtpm ^
    --shielded-integrity-monitoring ^
    --labels=environment=production,service=notification ^
    --reservation-affinity=any ^
    --tags=notification-service

echo Creating firewall rule...
gcloud compute firewall-rules create allow-notification-service ^
    --project=%PROJECT_ID% ^
    --direction=INGRESS ^
    --priority=1000 ^
    --network=default ^
    --action=ALLOW ^
    --rules=tcp:%SERVICE_PORT% ^
    --source-ranges=0.0.0.0/0 ^
    --target-tags=notification-service

echo Waiting for VM to be ready...
timeout /t 30 /nobreak

echo Getting VM external IP...
for /f %%i in ('gcloud compute instances describe %VM_NAME% --zone=%ZONE% --format="get(networkInterfaces[0].accessConfigs[0].natIP)"') do set EXTERNAL_IP=%%i
echo VM External IP: %EXTERNAL_IP%

echo Copying application files to VM...
gcloud compute scp target\notificationservice-0.0.1-SNAPSHOT.jar %VM_NAME%:~/app.jar --zone=%ZONE%
gcloud compute scp deploy\setup-vm.sh %VM_NAME%:~/setup-vm.sh --zone=%ZONE%
gcloud compute scp deploy\notification-service.service %VM_NAME%:~/notification-service.service --zone=%ZONE%

echo Setting up VM...
gcloud compute ssh %VM_NAME% --zone=%ZONE% --command="chmod +x ~/setup-vm.sh && ~/setup-vm.sh"

echo.
echo ======================================
echo Deployment completed successfully!
echo ======================================
echo VM Name: %VM_NAME%
echo External IP: %EXTERNAL_IP%
echo Zone: %ZONE%
echo Service URL: http://%EXTERNAL_IP%:%SERVICE_PORT%
echo Health Check: http://%EXTERNAL_IP%:%SERVICE_PORT%/health
echo WebSocket Test: http://%EXTERNAL_IP%:%SERVICE_PORT%/websocket-test.html
echo ======================================
echo.

pause