# Multi-stage Dockerfile for building and running the Spring Boot 3.5 (Java 21) app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy only what is needed for dependency resolution first to make use of layer caching
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY src src

# Build the application (skip tests in container build for speed)
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
