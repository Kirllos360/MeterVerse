# Installation Guide — Meter Verse Reporting Engine

**Version:** 1.0.0  
**Last Updated:** June 2025

This guide covers system requirements, database setup, message broker configuration, font installation, building from source, Docker deployment, and troubleshooting.

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Database Setup (PostgreSQL 16)](#2-database-setup-postgresql-16)
3. [Message Broker Setup (RabbitMQ)](#3-message-broker-setup-rabbitmq)
4. [Font Installation](#4-font-installation)
5. [Building from Source](#5-building-from-source)
6. [Docker Deployment](#6-docker-deployment)
7. [Kubernetes Deployment](#7-kubernetes-deployment)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Post-Installation Verification](#9-post-installation-verification)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. System Requirements

### Minimum (Development)

| Resource    | Specification              |
|-------------|----------------------------|
| CPU         | 2 cores, x86_64 / ARM64   |
| RAM         | 4 GB                       |
| Disk        | 10 GB SSD                  |
| OS          | Linux (Ubuntu 22.04+), macOS 14+, Windows Server 2022+ |
| Java        | JDK 21 (Eclipse Temurin recommended) |
| Docker      | 24.0+ (optional)           |

### Recommended (Production)

| Resource    | Specification               |
|-------------|-----------------------------|
| CPU         | 8 cores, x86_64            |
| RAM         | 16 GB                       |
| Disk        | 200 GB SSD (NVMe preferred)|
| Network     | 1 Gbps                      |
| OS          | Ubuntu 24.04 LTS / RHEL 9  |
| Java        | JDK 21 (Eclipse Temurin)   |
| Docker      | 24.0+                      |
| PostgreSQL  | 16 with `pg_stat_statements` |
| RabbitMQ    | 4.x with quorum queues      |

### Supported Architectures

- `linux/amd64` — fully tested
- `linux/arm64` — compatible (tested on AWS Graviton)
- `windows/x86_64` — development only (not production-tested)

---

## 2. Database Setup (PostgreSQL 16)

### 2.1 Install PostgreSQL 16

**Ubuntu 24.04:**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**RHEL 9 / Rocky Linux 9:**
```bash
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql16-server postgresql16-contrib
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl enable postgresql-16
sudo systemctl start postgresql-16
```

**Docker:**
```bash
docker run -d \
  --name meterverse-db \
  -e POSTGRES_DB=meter_verse_reporting \
  -e POSTGRES_USER=meter_verse \
  -e POSTGRES_PASSWORD=<secure-password> \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### 2.2 Create Database and User

```sql
CREATE USER meter_verse WITH PASSWORD '<secure-password>';
CREATE DATABASE meter_verse_reporting OWNER meter_verse;
GRANT ALL PRIVILEGES ON DATABASE meter_verse_reporting TO meter_verse;

\c meter_verse_reporting
GRANT ALL ON SCHEMA public TO meter_verse;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO meter_verse;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO meter_verse;
```

### 2.3 Connection Pooling (PgBouncer — Optional)

For high-concurrency production deployments, use PgBouncer:

```bash
docker run -d \
  --name pgbouncer \
  -e DATABASE_URL=postgres://meter_verse:<password>@postgres:5432/meter_verse_reporting \
  -e POOL_MODE=transaction \
  -e MAX_CLIENT_CONN=200 \
  -e DEFAULT_POOL_SIZE=50 \
  -p 6432:6432 \
  edoburu/pgbouncer
```

Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://pgbouncer:6432/meter_verse_reporting
```

### 2.4 Recommended PostgreSQL Tuning

Edit `postgresql.conf`:

```ini
# Memory
shared_buffers = '4GB'                # 25% of RAM
effective_cache_size = '12GB'         # 75% of RAM
work_mem = '64MB'                     # per-operation sort memory
maintenance_work_mem = '1GB'          # VACUUM, CREATE INDEX

# Write-Ahead Log
wal_level = replica
max_wal_size = '4GB'
min_wal_size = '1GB'
wal_buffers = '16MB'

# Query Planner
random_page_cost = 1.1                # SSD-optimised
effective_io_concurrency = 200        # SSD
default_statistics_target = 500

# Parallelism
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_worker_processes = 16

# Connections
max_connections = 100
```

### 2.5 Flyway Migrations

Migrations run automatically on startup. Manual execution:

```bash
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/meter_verse_reporting \
                   -Dflyway.user=meter_verse \
                   -Dflyway.password=<password>
```

---

## 3. Message Broker Setup (RabbitMQ)

### 3.1 Install RabbitMQ

**Docker:**
```bash
docker run -d \
  --name meterverse-rmq \
  -e RABBITMQ_DEFAULT_USER=meter_verse \
  -e RABBITMQ_DEFAULT_PASS=<secure-password> \
  -p 5672:5672 \
  -p 15672:15672 \
  -v rmqdata:/var/lib/rabbitmq \
  rabbitmq:4-management-alpine
```

**Ubuntu 24.04:**
```bash
apt install -y rabbitmq-server
systemctl enable rabbitmq-server
systemctl start rabbitmq-server
rabbitmq-plugins enable rabbitmq_management
rabbitmqctl add_user meter_verse <secure-password>
rabbitmqctl set_user_tags meter_verse administrator
rabbitmqctl set_permissions -p / meter_verse ".*" ".*" ".*"
```

### 3.2 Queue Configuration

The application automatically declares a **quorum queue** named `report-generation` on startup with:

| Argument             | Value     | Description                      |
|----------------------|-----------|----------------------------------|
| `x-queue-type`       | `quorum`  | Durable replicated queue         |
| `x-max-length`       | `50000`   | Maximum messages before reject   |
| `x-overflow`         | `reject-publish` | Behaviour when queue is full |

### 3.3 Management Interface

```
URL:      http://<host>:15672
Username: meter_verse
Password: <configured-password>
```

Monitor: queue depth (`report-generation`), consumer count, publish rates.

### 3.4 Production RabbitMQ Tuning

```ini
# /etc/rabbitmq/rabbitmq.conf
queue_master_locator = min-masters
vm_memory_high_watermark.relative = 0.7
vm_memory_high_watermark_paging_ratio = 0.8
total_memory_available_override_value = 8GB
disk_free_limit.absolute = 2GB
collect_statistics_interval = 10000
```

---

## 4. Font Installation

### 4.1 DejaVu Sans (Required for Arabic)

The application requires **DejaVu Sans** for Arabic PDF rendering.

**Ubuntu/Debian:**
```bash
apt install -y fonts-dejavu-core fonts-dejavu-extra
fc-cache -f -v
```

**Alpine (Docker):**
```dockerfile
RUN apk add --no-cache fontconfig ttf-dejavu
```

**Verify:**
```bash
fc-list | grep -i dejavu
```

### 4.2 Custom Font Extension

Build the JasperReports font extension JAR:

```bash
cd jasperreports-fonts-extension
mvn clean package
```

This produces `target/meterverse-fonts-1.0.0-jar-with-dependencies.jar`.

The JAR bundles fonts configured in `src/main/resources/fonts/fonts.xml`:

| Font Family        | Files Required                                                    |
|--------------------|-------------------------------------------------------------------|
| DejaVu Sans        | `DejaVuSans.ttf`, `DejaVuSans-Bold.ttf`, `DejaVuSans-Oblique.ttf`, `DejaVuSans-BoldOblique.ttf` |
| DejaVu Sans Mono   | `DejaVuSansMono.ttf`, `DejaVuSansMono-Bold.ttf`, `DejaVuSansMono-Oblique.ttf`, `DejaVuSansMono-BoldOblique.ttf` |
| Arial              | `Arial.ttf`, `Arial-Bold.ttf`, `Arial-Italic.ttf`, `Arial-BoldItalic.ttf` |
| Times New Roman    | `TimesNewRoman.ttf`, `TimesNewRoman-Bold.ttf`, `TimesNewRoman-Italic.ttf`, `TimesNewRoman-BoldItalic.ttf` |

### 4.3 Font Directory Structure

```
fonts/
├── fonts.xml                    # Font families registry
├── DejaVuSans.ttf
├── DejaVuSans-Bold.ttf
├── DejaVuSans-Oblique.ttf
├── DejaVuSans-BoldOblique.ttf
├── DejaVuSansMono.ttf
├── DejaVuSansMono-Bold.ttf
├── DejaVuSansMono-Oblique.ttf
├── DejaVuSansMono-BoldOblique.ttf
├── Arial.ttf
├── Arial-Bold.ttf
├── Arial-Italic.ttf
├── Arial-BoldItalic.ttf
├── TimesNewRoman.ttf
├── TimesNewRoman-Bold.ttf
├── TimesNewRoman-Italic.ttf
└── TimesNewRoman-BoldItalic.ttf
```

### 4.4 Verifying Fonts in JasperReports

Test font availability at runtime:

```bash
curl -X POST http://localhost:8080/api/v1/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"reportName":"ElectricityInvoice","format":"PDF","parameters":{"utilityType":"ELECTRICITY"},"language":"ar"}'
```

If font errors appear, check that `fonts.xml` paths match the classpath location.

---

## 5. Building from Source

### 5.1 Prerequisites

```bash
java --version    # Must be 21+
mvn --version     # Must be 3.9+
```

### 5.2 Build Commands

```bash
# Clone the repository
git clone <repository-url>
cd reporting-engine

# Full build (compile, test, package)
mvn clean package

# Build without tests
mvn clean package -DskipTests

# Build without tests or checkstyle
mvn clean package -DskipTests -Dmaven.test.skip=true

# Build and install to local Maven repo
mvn clean install -DskipTests
```

### 5.3 Build Output

| Artifact                  | Location                          | Description           |
|---------------------------|-----------------------------------|-----------------------|
| `reporting-engine-1.0.0.jar` | `target/`                      | Fat executable JAR    |
| `meterverse-fonts-1.0.0.jar` | `jasperreports-fonts-extension/target/` | Font extension JAR |

### 5.4 Pre-compile JRXML Templates

JRXML files are automatically compiled during the `generate-resources` phase:

```bash
mvn generate-resources
```

Compiled `.jasper` files are placed in the `compiled/` directory.

### 5.5 Running Locally

```bash
# Run with Spring Boot Maven plugin
mvn spring-boot:run

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run the packaged JAR
java -jar target/reporting-engine-1.0.0.jar
```

---

## 6. Docker Deployment

### 6.1 Building the Docker Image

```bash
docker build -t meterverse/reporting-engine:1.0.0 .
```

The multi-stage build:
1. **Builder stage:** Eclipse Temurin 21 JDK Alpine, compiles project
2. **Runtime stage:** Eclipse Temurin 21 JRE Alpine + fonts

### 6.2 Docker Compose — Full Stack

```yaml
# docker-compose.yml (included in repository)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: meter_verse_reporting
      POSTGRES_USER: meter_verse
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meter_verse -d meter_verse_reporting"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:4-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: meter_verse
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      interval: 15s
      timeout: 5s
      retries: 5

  reporting-engine:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: meter_verse_reporting
      DB_USER: meter_verse
      DB_PASSWORD: ${DB_PASSWORD}
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_PORT: 5672
      RABBITMQ_USER: meter_verse
      RABBITMQ_PASSWORD: ${RABBITMQ_PASSWORD}
      PDF_OWNER_PASSWORD: ${PDF_OWNER_PASSWORD}
      SPRING_PROFILES_ACTIVE: production
    depends_on:
      postgres: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    volumes:
      - compiled_reports:/app/compiled
      - template_storage:/root/.meterverse/templates
      - ./fonts:/app/fonts:ro

volumes:
  pgdata:
  compiled_reports:
  template_storage:
```

### 6.3 Running

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f reporting-engine

# Scale consumers for bulk generation
docker compose up -d --scale reporting-engine=3

# Stop all services
docker compose down
```

### 6.4 Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### 6.5 Docker Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4g
    reservations:
      cpus: '2'
      memory: 1g
```

---

## 7. Kubernetes Deployment

### 7.1 Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: meterverse
```

### 7.2 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: reporting-engine-config
  namespace: meterverse
data:
  application.yml: |
    spring:
      jpa:
        show-sql: "false"
        hibernate:
          ddl-auto: validate
    jasper:
      export:
        pdf:
          compressed: true
    logging:
      level:
        com.meterverse: INFO
```

### 7.3 Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: reporting-engine-secrets
  namespace: meterverse
type: Opaque
stringData:
  DB_PASSWORD: "<base64-or-plaintext>"
  RABBITMQ_PASSWORD: "<base64-or-plaintext>"
  PDF_OWNER_PASSWORD: "<base64-or-plaintext>"
```

### 7.4 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reporting-engine
  namespace: meterverse
spec:
  replicas: 2
  selector:
    matchLabels:
      app: reporting-engine
  template:
    metadata:
      labels:
        app: reporting-engine
    spec:
      containers:
      - name: reporting-engine
        image: meterverse/reporting-engine:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: postgres.meterverse.svc.cluster.local
        - name: DB_PORT
          value: "5432"
        - name: DB_NAME
          value: meter_verse_reporting
        - name: DB_USER
          value: meter_verse
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: reporting-engine-secrets
              key: DB_PASSWORD
        - name: RABBITMQ_HOST
          value: rabbitmq.meterverse.svc.cluster.local
        - name: RABBITMQ_PORT
          value: "5672"
        - name: RABBITMQ_USER
          value: meter_verse
        - name: RABBITMQ_PASSWORD
          valueFrom:
            secretKeyRef:
              name: reporting-engine-secrets
              key: RABBITMQ_PASSWORD
        - name: PDF_OWNER_PASSWORD
          valueFrom:
            secretKeyRef:
              name: reporting-engine-secrets
              key: PDF_OWNER_PASSWORD
        - name: SPRING_PROFILES_ACTIVE
          value: production
        - name: JAVA_OPTS
          value: "-Xms2g -Xmx4g -XX:+UseZGC -XX:MaxGCPauseMillis=50"
        livenessProbe:
          httpGet:
            path: /api/v1/actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "4"
        volumeMounts:
        - name: compiled
          mountPath: /app/compiled
        - name: templates
          mountPath: /root/.meterverse/templates
      volumes:
      - name: compiled
        emptyDir: {}
      - name: templates
        persistentVolumeClaim:
          claimName: template-storage-pvc
```

### 7.5 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: reporting-engine
  namespace: meterverse
spec:
  selector:
    app: reporting-engine
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### 7.6 HorizontalPodAutoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: reporting-engine-hpa
  namespace: meterverse
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: reporting-engine
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 8. Environment Variables Reference

### Database

| Variable      | Required | Default                         | Description                    |
|---------------|----------|---------------------------------|--------------------------------|
| `DB_HOST`     | Yes      | `localhost`                     | PostgreSQL server hostname     |
| `DB_PORT`     | No       | `5432`                          | PostgreSQL server port         |
| `DB_NAME`     | Yes      | `meter_verse_reporting`         | Database name                  |
| `DB_USER`     | Yes      | `meter_verse`                   | Database user                  |
| `DB_PASSWORD` | Yes      | `meter_verse_dev`               | Database password              |
| `DB_URL`      | No       | —                               | Full JDBC URL (overrides above)|

### RabbitMQ

| Variable             | Required | Default  | Description                |
|----------------------|----------|----------|----------------------------|
| `RABBITMQ_HOST`      | Yes      | `localhost` | RabbitMQ server hostname |
| `RABBITMQ_PORT`      | No       | `5672`   | RabbitMQ server port       |
| `RABBITMQ_USER`      | Yes      | `guest`  | RabbitMQ username          |
| `RABBITMQ_PASSWORD`  | Yes      | `guest`  | RabbitMQ password          |
| `RABBITMQ_VHOST`     | No       | `/`      | RabbitMQ virtual host      |

### PDF Security

| Variable                  | Required | Default                             | Description                |
|---------------------------|----------|-------------------------------------|----------------------------|
| `PDF_OWNER_PASSWORD`      | Yes      | `changeit`                          | PDF owner password         |
| `PDF_KEYSTORE_PATH`       | No       | `/etc/meterverse/keystore.p12`      | PKCS12 keystore path       |
| `PDF_KEYSTORE_PASSWORD`   | Yes      | `changeit`                          | Keystore password          |
| `PDF_KEYSTORE_ALIAS`      | No       | `meterverse-ca`                     | Certificate alias in store |

### Templates

| Variable           | Required | Default                       | Description              |
|--------------------|----------|-------------------------------|--------------------------|
| `TEMPLATE_STORAGE` | No       | `~/.meterverse/templates`     | Template file storage    |

### JVM

| Variable    | Required | Default                              | Description     |
|-------------|----------|--------------------------------------|-----------------|
| `JAVA_OPTS` | No       | `-Xms512m -Xmx2g -XX:+UseZGC`       | JVM arguments   |

### Logging

| Variable    | Required | Default                              | Description     |
|-------------|----------|--------------------------------------|-----------------|
| `LOG_PATH`  | No       | `${java.io.tmpdir}/meterverse-logs`  | Log file path   |

### Spring Profile

| Variable               | Required | Default    | Description                    |
|------------------------|----------|------------|--------------------------------|
| `SPRING_PROFILES_ACTIVE` | No    | —          | Active Spring profile(s)       |

---

## 9. Post-Installation Verification

### 9.1 Health Check

```bash
curl http://localhost:8080/api/v1/actuator/health
```

Expected response:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "rabbitmq": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### 9.2 Database Connectivity

```bash
curl http://localhost:8080/api/v1/actuator/health/db
```

### 9.3 Generate Test Report

```bash
curl -X POST http://localhost:8080/api/v1/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportName": "ElectricityInvoice",
    "format": "PDF",
    "parameters": {"utilityType": "ELECTRICITY"},
    "invoiceIds": ["<valid-uuid>"],
    "language": "ar"
  }' \
  --output test_report.pdf
```

### 9.4 Verify RabbitMQ Connection

```bash
curl http://localhost:15672/api/queues/%2f/report-generation \
  -u meter_verse:<password>
```

### 9.5 Cache Metrics

```bash
curl http://localhost:8080/api/v1/actuator/caches
```

---

## 10. Troubleshooting Common Issues

### Issue: Application fails to start — database connection refused

**Error:**
```
Failed to obtain JDBC Connection: Connections could not be acquired from the underlying database!
```

**Checklist:**
1. Is PostgreSQL running? `pg_isready -h <host> -p <port>`
2. Are credentials correct? Verify `DB_USER` and `DB_PASSWORD`
3. Is the database created? `psql -U meter_verse -d meter_verse_reporting -c "SELECT 1"`
4. Is the hostname resolvable? `nslookup <DB_HOST>`
5. Firewall? `nc -zv <DB_HOST> 5432`

### Issue: RabbitMQ connection failure

**Error:**
```
org.springframework.amqp.AmqpConnectException: java.net.ConnectException: Connection refused
```

**Checklist:**
1. Is RabbitMQ running? `rabbitmq-diagnostics status`
2. TCP port open? `nc -zv <RABBITMQ_HOST> 5672`
3. Credentials correct? `curl -u user:pass http://<host>:15672/api/overview`
4. Virtual host exists? `rabbitmqctl list_vhosts`

### Issue: PDF generation fails — font not found

**Error:**
```
net.sf.jasperreports.engine.util.JRFontNotFoundException: Font 'DejaVu Sans' is not available to the JVM.
```

**Checklist:**
1. Are fonts installed on the system? `fc-list | grep DejaVu`
2. Is the font extension JAR on the classpath? `jar tf target/reporting-engine-1.0.0.jar | grep fonts.xml`
3. Are font files present? `ls -la src/main/resources/fonts/`
4. In Docker: run `fc-cache -f -v` and check output

**Fix — manual registration:**
```bash
# Copy fonts to a known location
mkdir -p /usr/share/fonts/truetype/dejavu
cp src/main/resources/fonts/*.ttf /usr/share/fonts/truetype/dejavu/
fc-cache -f -v
```

### Issue: Arabic text not rendering correctly

**Error:** Arabic characters appear as boxes or reversed.

**Checklist:**
1. Is `jasper.export.pdf.arabic.enabled=true` in config?
2. Is `jasper.export.pdf.arabic.renderer=icu4j` set?
3. Do fonts have `supportsArabic=true` in `fonts.xml`?
4. Is ICU4J on the classpath? (`com.ibm.icu:icu4j:76.1`)

### Issue: Out of memory during bulk generation

**Error:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solutions:**
1. Increase heap: `JAVA_OPTS="-Xms4g -Xmx8g"`
2. Reduce bulk chunk size: `bulk.streaming.chunk-size=500`
3. Reduce prefetch count: `spring.rabbitmq.listener.simple.prefetch=5`
4. Add more consumers: `docker compose up -d --scale reporting-engine=3`

### Issue: Slow report generation

**Checklist:**
1. Are compiled reports cached? Check `GET /actuator/caches` for hit ratio
2. Is HikariCP pool sized correctly? `GET /actuator/metrics/hikaricp.connections.active`
3. Are database queries indexed? Run `EXPLAIN ANALYZE` on report queries
4. Check GC pauses: `GET /actuator/metrics/jvm.gc.pause`

### Issue: Flyway migration fails

**Error:**
```
org.flywaydb.core.api.FlywayException: Migration V1__init_schema.sql failed
```

**Common causes:**
1. Running against an existing schema not created by Flyway
2. Insufficient database privileges
3. Corrupted migration state

**Recovery:**
```sql
-- Reset Flyway (Caution: may lose data)
TRUNCATE flyway_schema_history;
-- Or repair
mvn flyway:repair
```

### Issue: File upload exceeds limit

**Error:**
```
MaxUploadSizeExceededException: File upload exceeds maximum allowed size
```

**Fix in `application.yml`:**
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB
```

### Issue: CORS errors from frontend

**Check `WebConfig.java`:**
```java
registry.addMapping("/api/**")
    .allowedOrigins("https://<frontend-domain>")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true)
    .maxAge(3600);
```

Ensure the frontend origin matches exactly (no trailing slash, protocol matches).

### Issue: Digital signature fails

**Error:**
```
java.security.UnrecoverableKeyException: Cannot recover key
```

**Checklist:**
1. Is the keystore in PKCS12 format? `keytool -list -keystore keystore.p12 -storetype PKCS12`
2. Is the alias correct? `keytool -list -keystore keystore.p12 | grep alias`
3. Are BouncyCastle dependencies present? (should be in the fat JAR)
4. Check password encoding (no special characters that may be escaped)
