# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend with integrated Frontend static assets
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests -B

# Stage 3: Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    DB_URL="jdbc:mysql://localhost:3306/billwiseai?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
    DB_USERNAME=root \
    DB_PASSWORD=root

RUN mkdir -p /app/uploads && addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=backend-builder /app/backend/target/billwiseai-0.0.1-SNAPSHOT.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
