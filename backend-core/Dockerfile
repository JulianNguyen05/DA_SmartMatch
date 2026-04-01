# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven files trước để cache dependency
COPY .mvn/ .mvn
COPY mvnw mvnw
COPY pom.xml .
COPY domain/pom.xml domain/
COPY application/pom.xml application/
COPY infrastructure/pom.xml infrastructure/
COPY api/pom.xml api/

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY domain/src domain/src
COPY application/src application/src
COPY infrastructure/src infrastructure/src
COPY api/src api/src

# Build toàn bộ project
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Tạo user không root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Copy jar từ module api
COPY --from=builder /app/api/target/api-*.jar app.jar

# Extract layered jar (tối ưu cache Docker)
RUN java -Djarmode=layertools -jar app.jar extract

# Run
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]