FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl fontconfig ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
    && fc-cache -f -v

WORKDIR /app
COPY --from=builder /build/target/reporting-engine-*.jar app.jar
COPY --from=builder /build/compiled ./compiled
COPY fonts /app/fonts
RUN mkdir -p /root/.meterverse/templates /tmp/jasper-compiled

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseZGC", "-XX:MaxGCPauseMillis=50", \
            "-Xms512m", "-Xmx2g", \
            "-Djava.io.tmpdir=/tmp", \
            "-jar", "app.jar"]
