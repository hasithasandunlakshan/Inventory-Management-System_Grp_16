# Kafka Deployment on GitHub Codespaces

This guide explains how to run your Kafka setup in GitHub Codespaces.

## What is GitHub Codespaces?

GitHub Codespaces provides a complete development environment in the cloud with:
- Pre-configured development container
- Docker support
- Port forwarding for accessing services
- 60 hours/month free for personal accounts

## Prerequisites

- GitHub account
- Repository pushed to GitHub
- GitHub Codespaces enabled (free tier available)

## Setup Steps

### 1. Push Your Code to GitHub

```bash
# If not already initialized
cd "c:\Users\PC\Desktop\SEM 5 Project\Inventory-Management-System_Grp_16\gcp-kafka-deployment"
git init
git add .
git commit -m "Add Kafka deployment configuration"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/kafka-deployment.git
git branch -M main
git push -u origin main
```

### 2. Start a Codespace

1. Go to your GitHub repository
2. Click the **Code** button (green button)
3. Select **Codespaces** tab
4. Click **Create codespace on main**

Wait for the codespace to build (2-3 minutes first time).

### 3. Start Kafka Services

Once the codespace is ready, run:

```bash
chmod +x start-codespaces.sh
./start-codespaces.sh
```

This will:
- Start Zookeeper, Kafka, and Kafka UI
- Create all required topics
- Display connection information

### 4. Access Services

**Port Forwarding:**
- GitHub automatically forwards ports 9092, 2181, and 8088
- Click on the **PORTS** tab at the bottom of VS Code
- You'll see forwarded URLs for each service

**Kafka UI:**
- Find port 8088 in the PORTS tab
- Click the globe icon to open Kafka UI in browser
- Or click the link in the "Forwarded Address" column

**Kafka Connection:**
- **From within Codespace:** Use `localhost:9092`
- **From your local machine:** Use the forwarded URL from PORTS tab

### 5. Configure Your Spring Boot Services

In your `application.properties` or `application.yml`:

```properties
# For services running IN the same Codespace
spring.kafka.bootstrap-servers=localhost:9092

# For services running on your LOCAL machine
# Use the forwarded address from the PORTS tab
spring.kafka.bootstrap-servers=https://your-codespace-url.app.github.dev
```

## Managing Services

**Check Status:**
```bash
docker-compose -f docker-compose-codespaces.yml ps
```

**View Logs:**
```bash
docker-compose -f docker-compose-codespaces.yml logs -f kafka
```

**Stop Services:**
```bash
docker-compose -f docker-compose-codespaces.yml down
```

**Restart Services:**
```bash
docker-compose -f docker-compose-codespaces.yml restart
```

**List Topics:**
```bash
docker exec kafka kafka-topics --list --bootstrap-server localhost:29092
```

## Advantages of Codespaces

✅ **No local setup required** - Everything runs in the cloud
✅ **Consistent environment** - Same setup for all team members
✅ **Port forwarding** - Access services via secure URLs
✅ **Free tier** - 60 hours/month for personal accounts
✅ **Docker support** - Full Docker and Docker Compose support
✅ **VS Code integration** - Full IDE in browser or local VS Code

## Limitations

⚠️ **Resource limits** - 2-4 CPU cores, 8GB RAM (sufficient for Kafka)
⚠️ **Sleep mode** - Codespace stops after 30 minutes of inactivity
⚠️ **Storage** - Data is lost when Codespace is deleted (use volumes for persistence)
⚠️ **Network** - External access requires port forwarding URLs

## Troubleshooting

**Services not starting:**
```bash
docker-compose -f docker-compose-codespaces.yml logs
```

**Out of memory:**
- Reduce Kafka heap size in `docker-compose-codespaces.yml`
- Current setting: `-Xmx512M -Xms512M`

**Port forwarding not working:**
- Check the PORTS tab
- Ensure ports are set to "Public" visibility
- Restart the port forwarding

**Codespace stopped:**
- Data in containers is lost
- Restart with `./start-codespaces.sh`
- Topics will be recreated automatically

## Cost Considerations

**Free Tier:**
- 60 hours/month for personal accounts
- 2-core machine

**Paid Plans:**
- Additional hours: ~$0.18/hour (2-core)
- 4-core machine: ~$0.36/hour

**Tips to save hours:**
- Stop codespace when not in use
- Set shorter timeout periods
- Use prebuild configurations

## Alternative: Run Locally in VS Code

You can also use the Dev Container locally:

1. Install Docker Desktop
2. Install "Dev Containers" extension in VS Code
3. Open folder in container (Command Palette → "Reopen in Container")
4. Run `./start-codespaces.sh`

This gives you the same environment without using Codespaces hours.

## Support

For issues or questions:
1. Check container logs
2. Verify port forwarding in PORTS tab
3. Ensure Docker is running in Codespace
4. Check GitHub Codespaces documentation

## Next Steps

After Kafka is running:
1. Update your Spring Boot services with the connection URL
2. Test connectivity from your services
3. Monitor topics in Kafka UI
4. Deploy your microservices to the same Codespace or connect them externally
