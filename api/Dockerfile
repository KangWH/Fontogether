# Gradle은 아직 Java 25를 실행 환경으로 완벽히 지원하지 않을 수 있어 빌더는 JDK 21(LTS)을 사용합니다.
# Gradle Toolchain이 컴파일을 위해 JDK 25를 자동으로 다운로드하거나, 
# 만약 다운로드가 실패하면 JDK 21로 컴파일하도록 설정을 변경할 수도 있습니다.
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
RUN ./gradlew build -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]
