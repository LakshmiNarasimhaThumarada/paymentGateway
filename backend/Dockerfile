# ==========================================
# Build Stage
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Copy pom.xml and resolve dependencies (improves Docker cache build speed)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Run Stage
# ==========================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy packaged JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose server port (8081)
EXPOSE 8081

# Run Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
