# Oracle Cloud Deployment Checklist

## Pre-Deployment Checklist

### ✅ Oracle Cloud Account Setup
- [ ] Sign up at https://cloud.oracle.com
- [ ] Verify email address
- [ ] Complete phone verification
- [ ] Add credit card (for verification)
- [ ] Choose home region

### ✅ VM Instance Creation
- [ ] Create compute instance
- [ ] Choose Oracle Linux 8 or Ubuntu 20.04
- [ ] Select VM.Standard.E2.1.Micro (free tier)
- [ ] Assign public IP
- [ ] Generate/upload SSH key pair
- [ ] Save private key securely

### ✅ Network Security Configuration
- [ ] Configure Security List
- [ ] Add SSH rule (port 22)
- [ ] Add API Gateway rule (port 8090)
- [ ] Add HTTP rule (port 80) - optional
- [ ] Add HTTPS rule (port 443) - optional

### ✅ VM Connection Setup
- [ ] Note down public IP address
- [ ] Test SSH connection: `ssh -i private-key opc@PUBLIC_IP`
- [ ] Verify sudo access

## Deployment Checklist

### ✅ File Transfer
Choose one method:
- [ ] **SCP**: `scp -i key -r ApiGateway/ opc@PUBLIC_IP:/home/opc/`
- [ ] **Git**: Clone your repository on VM
- [ ] **SFTP**: Use WinSCP or similar tool

### ✅ Project Setup on VM
- [ ] Connect to VM: `ssh -i private-key opc@PUBLIC_IP`
- [ ] Navigate to project: `cd /home/opc/ApiGateway`
- [ ] Make script executable: `chmod +x deploy.sh`
- [ ] Run deployment: `./deploy.sh`

### ✅ Firewall Configuration
- [ ] Check firewall status: `sudo systemctl status firewalld`
- [ ] Open port 8090: `sudo firewall-cmd --permanent --add-port=8090/tcp`
- [ ] Reload firewall: `sudo firewall-cmd --reload`

### ✅ Verification
- [ ] Check Docker containers: `docker ps`
- [ ] Test internal health: `curl http://localhost:8090/actuator/health`
- [ ] Test external access: `http://PUBLIC_IP:8090/actuator/health`
- [ ] Verify logs: `docker-compose logs api-gateway`

## Post-Deployment Checklist

### ✅ Service Management
- [ ] Test service restart: `docker-compose restart`
- [ ] Verify auto-restart: `docker-compose ps`
- [ ] Check resource usage: `docker stats`

### ✅ Security & Maintenance
- [ ] Update system: `sudo yum update -y`
- [ ] Setup backup strategy
- [ ] Monitor resource usage in OCI console
- [ ] Configure log rotation if needed

### ✅ Documentation
- [ ] Document your public IP address
- [ ] Note SSH key location
- [ ] Record service URLs
- [ ] Save OCI console login details

## Important Information to Save

**VM Details:**
- Public IP: ________________
- Private Key Path: ________________
- SSH Command: `ssh -i _______ opc@_______`

**Service URLs:**
- API Gateway: `http://YOUR_PUBLIC_IP:8090`
- Health Check: `http://YOUR_PUBLIC_IP:8090/actuator/health`

**Useful Commands:**
```bash
# Connect to VM
ssh -i private-key opc@PUBLIC_IP

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api-gateway

# Restart service
docker-compose restart

# Stop service
docker-compose down

# Start service
docker-compose up -d
```

## Emergency Contacts & Resources

- Oracle Cloud Support: https://support.oracle.com
- Oracle Cloud Documentation: https://docs.oracle.com/en-us/iaas/
- Docker Documentation: https://docs.docker.com/
- Spring Boot Documentation: https://spring.io/projects/spring-boot

---

**Estimated Total Time:** 30-45 minutes for first-time setup

**Next Steps After Deployment:**
1. Test your API Gateway endpoints
2. Connect other microservices
3. Set up monitoring and logging
4. Configure SSL/HTTPS (recommended for production)
5. Set up automated backups