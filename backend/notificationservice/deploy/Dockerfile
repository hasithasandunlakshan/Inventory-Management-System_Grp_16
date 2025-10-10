# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the jar file
COPY target/notificationservice-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 8087

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8087/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]