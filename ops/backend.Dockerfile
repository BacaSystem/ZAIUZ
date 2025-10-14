# ---------- Build stage ----------
FROM gradle:8.9-jdk21 AS build
WORKDIR /app

# Copy Gradle configuration files
COPY backend/settings.gradle backend/build.gradle ./

# Copy Gradle Wrapper
COPY backend/gradle ./gradle/
COPY backend/gradlew backend/gradlew.bat ./

# Copy source code
COPY backend/src ./src

# Build bootable jar (skip tests for faster image builds)
RUN gradle bootJar -x test --no-daemon

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/backend-*.jar /app/app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]