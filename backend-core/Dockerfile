# Bước 1: Build file .jar bằng Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build bỏ qua test để tăng tốc độ khởi chạy
RUN mvn clean package -DskipTests

# Bước 2: Chạy file .jar bằng JRE
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]