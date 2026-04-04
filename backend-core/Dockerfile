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

### Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

### Tạo user không root VÀ cấp quyền sở hữu thư mục /app cho user spring
RUN addgroup -S spring && adduser -S spring -G spring && chown -R spring:spring /app

### Chuyển sang user spring SAU KHI đã cấp quyền
USER spring

### Copy jar từ module api, thêm cờ --chown=spring:spring để user có quyền với file jar
COPY --chown=spring:spring --from=builder /app/api/target/api-*.jar app.jar

### Run - Chạy trực tiếp file jar
ENTRYPOINT ["java", "-jar", "app.jar"]