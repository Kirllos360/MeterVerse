# Meter Verse Enterprise Reporting Engine

**Version:** 1.0.0 | **Java:** 21 | **Spring Boot:** 3.4.1 | **JasperReports:** 7.0.1

Enterprise reporting subsystem for the Meter Verse utility management platform. Generates, secures, and bulk-processes invoices and reports across electricity, water, and gas utilities with full Arabic/RTL support.

---

## Architecture Overview

The application follows a **Domain-Driven Design (DDD)** modular monolith architecture with 6 bounded contexts:

```
┌─────────────────────────────────────────────────────────────────┐
│                        REST API (port 8080)                     │
│                    context-path: /api/v1                         │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  Report   │ Template │  Bulk    │  PDF     │  Billing │  Excel   │
│  Engine   │ Manager  │  Gen.    │ Security │  Engine  │  Engine  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ JasperRep │  DB +    │ RabbitMQ │ iText 9  │  Domain  │  JXLS +  │
│ orts +    │  Git     │  Queue   │ + BC     │  Model   │  Apache  │
│ 5 Export  │ Storage  │          │          │          │  POI     │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│                  Shared Infrastructure                          │
│  JPA/Flyway | Caffeine Cache | Actuator | Locale | Validation  │
├─────────────────────────────────────────────────────────────────┤
│                 PostgreSQL 16 | RabbitMQ 4                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Client → REST API → ReportService → ReportCompiler → ReportFiller → ReportExporter
                                        │                │               │
                                        ↓                ↓               ↓
                                   JasperReport     JasperPrint    PDF/XLSX/DOCX/HTML/CSV
                                                      │
                                              Bulk Generation
                                              (via RabbitMQ) → BulkConsumer
```

---

## Prerequisites

| Requirement   | Version       | Notes                                    |
|---------------|---------------|------------------------------------------|
| Java          | 21 (LTS)      | Eclipse Temurin recommended              |
| Maven         | 3.9+          | For building from source                 |
| Docker        | 24+           | For containerised deployment             |
| Docker Compose| 2.20+         | For local development stack              |
| PostgreSQL    | 16            | With `pgvector` optional                 |
| RabbitMQ      | 4.x           | Management plugin recommended            |

---

## Quick Start

### 1. Clone and Build

```bash
git clone <repository-url>
cd reporting-engine
mvn clean package -DskipTests
```

### 2. Run with Docker Compose

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5433`
- **RabbitMQ 4** on ports `5672` (AMQP) and `15672` (management UI)
- **Reporting Engine** on port `8080`

### 3. Verify

```bash
curl http://localhost:8080/api/v1/actuator/health
```

### 4. Access RabbitMQ Console

```
URL:      http://localhost:15672
Username: guest
Password: guest
```

---

## Configuration Reference

All configuration is in `src/main/resources/application.yml`. Override via environment variables.

### Server

| Property                     | Default       | Description                |
|------------------------------|---------------|----------------------------|
| `server.port`                | `8080`        | HTTP server port           |
| `server.servlet.context-path`| `/api/v1`     | REST API base path         |

### Database (HikariCP)

| Property                                | Default                                         | Environment Variable   |
|-----------------------------------------|-------------------------------------------------|------------------------|
| `spring.datasource.url`                 | `jdbc:postgresql://localhost:5432/meter_verse_reporting` | `DB_URL`     |
| `spring.datasource.username`            | `meter_verse`                                   | `DB_USER`              |
| `spring.datasource.password`            | `meter_verse_dev`                               | `DB_PASSWORD`          |
| `spring.datasource.hikari.maximum-pool-size` | `50`                                      | —                      |
| `spring.datasource.hikari.minimum-idle` | `10`                                            | —                      |
| `spring.datasource.hikari.idle-timeout` | `300000` (5 min)                                | —                      |
| `spring.datasource.hikari.connection-timeout` | `20000` (20 sec)                          | —                      |
| `spring.datasource.hikari.max-lifetime` | `1200000` (20 min)                              | —                      |

### RabbitMQ

| Property                          | Default    | Environment Variable |
|-----------------------------------|------------|----------------------|
| `spring.rabbitmq.host`            | `localhost`| `RABBITMQ_HOST`      |
| `spring.rabbitmq.port`            | `5672`     | `RABBITMQ_PORT`      |
| `spring.rabbitmq.username`        | `guest`    | `RABBITMQ_USER`      |
| `spring.rabbitmq.password`        | `guest`    | `RABBITMQ_PASSWORD`  |
| `spring.rabbitmq.listener.simple.prefetch` | `10`  | —                    |
| `spring.rabbitmq.listener.simple.concurrency` | `5` | —                    |
| `spring.rabbitmq.listener.simple.max-concurrency` | `20` | —                 |

### JasperReports

| Property                                        | Default                | Description                           |
|-------------------------------------------------|------------------------|---------------------------------------|
| `jasper.compiler.temp-directory`                | `tmp/jasper-compiled`  | Compilation working directory         |
| `jasper.export.pdf.compressed`                  | `true`                 | Enable PDF compression                |
| `jasper.export.pdf.encrypted`                   | `false`                | Encrypt PDF output                    |
| `jasper.export.pdf.permissions`                 | `COPY\|PRINT\|MODIFY`  | PDF permission flags                  |
| `jasper.export.pdf.font-name`                   | `DejaVu Sans`          | Default PDF font                      |
| `jasper.export.pdf.font-size`                   | `7`                    | Default PDF font size (pt)            |
| `jasper.export.pdf.arabic.enabled`              | `true`                 | Enable Arabic/RTL rendering           |
| `jasper.export.pdf.arabic.renderer`             | `icu4j`                | Arabic renderer (icu4j)               |
| `jasper.export.excel.detect-cell-type`          | `true`                 | Auto-detect cell types in Excel       |
| `jasper.export.excel.remove-empty-space-between-columns` | `true`    | Compact Excel layout                  |
| `jasper.export.html.embedded-images`            | `true`                 | Embed images in HTML                  |
| `jasper.cache.compiled-reports`                 | `true`                 | Cache compiled JasperReport objects   |
| `jasper.cache.max-cache-size`                   | `500`                  | Max cached report count               |
| `jasper.fonts.path`                             | `classpath:fonts/`     | Font resources path                   |
| `jasper.fonts.extensions`                       | `true`                 | Enable font extensions registry       |

### JXLS (Excel Engine)

| Property                    | Default                          | Description                  |
|-----------------------------|----------------------------------|------------------------------|
| `jxls.template-path`        | `classpath:templates/`           | Excel template directory     |
| `jxls.output-path`          | `${java.io.tmpdir}/jxls-output/` | JXLS output directory        |
| `jxls.image-path`           | `classpath:images/`              | Image resources path         |

### Template Manager

| Property                           | Default                              | Environment Variable |
|------------------------------------|--------------------------------------|----------------------|
| `template.storage.path`            | `~/.meterverse/templates`           | `TEMPLATE_STORAGE`   |
| `template.storage.max-versions`    | `50`                                 | —                    |
| `template.git.enabled`             | `false`                              | —                    |
| `template.git.remote`              | `""`                                 | `GIT_REMOTE_URL`     |

### PDF Security

| Property                          | Default                          | Environment Variable        |
|-----------------------------------|----------------------------------|-----------------------------|
| `pdf.security.owner-password`     | `changeit`                       | `PDF_OWNER_PASSWORD`        |
| `pdf.security.default-permissions`| `PRINT\|COPY\|MODIFY`            | —                           |
| `pdf.security.keystore.path`      | `/etc/meterverse/keystore.p12`   | `PDF_KEYSTORE_PATH`         |
| `pdf.security.keystore.password`  | `changeit`                       | `PDF_KEYSTORE_PASSWORD`     |
| `pdf.security.keystore.alias`     | `meterverse-ca`                  | —                           |

### Bulk Generation

| Property                        | Default             | Description                    |
|---------------------------------|---------------------|--------------------------------|
| `bulk.queue.name`               | `report-generation` | RabbitMQ queue name            |
| `bulk.queue.max-retries`        | `3`                 | Max retry attempts             |
| `bulk.queue.retry-delay-ms`     | `5000`              | Delay between retries         |
| `bulk.streaming.chunk-size`     | `1000`              | Streaming chunk size           |
| `bulk.streaming.flush-interval-ms` | `100`            | Streaming flush interval       |
| `bulk.threads.min`              | `4`                 | Min consumer threads           |
| `bulk.threads.max`              | `32`                | Max consumer threads           |

### Performance

| Property                                         | Default | Description                    |
|--------------------------------------------------|---------|--------------------------------|
| `performance.connection-pool.max-size`            | `50`    | Database connection pool max   |
| `performance.thread-pool.core`                   | `10`    | Async task thread pool core    |
| `performance.thread-pool.max`                    | `50`    | Async task thread pool max     |
| `performance.thread-pool.queue-capacity`          | `1000`  | Async task queue capacity      |
| `performance.cache.reports.maximum-size`          | `500`   | Compiled report cache size     |
| `performance.cache.reports.expire-after-write`    | `30m`   | Report cache TTL               |
| `performance.cache.templates.maximum-size`        | `200`   | Template cache size            |
| `performance.cache.templates.expire-after-write`  | `60m`   | Template cache TTL             |
| `performance.cache.images.maximum-size`           | `100`   | Image cache size               |
| `performance.cache.images.expire-after-write`     | `120m`  | Image cache TTL                |
| `performance.cache.fonts.maximum-size`            | `50`    | Font cache size                |
| `performance.cache.fonts.expire-after-write`      | `120m`  | Font cache TTL                 |

---

## API Documentation

All endpoints are prefixed with `/api/v1`. Standard error format:

```json
{
  "timestamp": "2025-06-27T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: reportName is required",
  "path": "/api/v1/api/reports/generate"
}
```

### Report Engine

#### `POST /api/reports/generate`
Generate a single report.

**Request:**
```json
{
  "reportName": "ElectricityInvoice",
  "format": "PDF",
  "parameters": {
    "utilityType": "ELECTRICITY"
  },
  "invoiceIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "language": "ar"
}
```

**Response:** Binary content with `Content-Type: application/pdf` and `Content-Disposition: attachment`.

Supported formats: `PDF`, `EXCEL`, `DOCX`, `HTML`, `CSV`, `XML`.

#### `POST /api/reports/batch`
Generate multiple reports in a single request.

**Request:**
```json
[
  {
    "reportName": "ElectricityInvoice",
    "format": "PDF",
    "parameters": { "utilityType": "ELECTRICITY" },
    "invoiceIds": ["550e8400-e29b-41d4-a716-446655440000"]
  },
  {
    "reportName": "WaterInvoice",
    "format": "PDF",
    "parameters": { "utilityType": "WATER" },
    "invoiceIds": ["660e8400-e29b-41d4-a716-446655440001"]
  }
]
```

**Response:**
```json
[
  {
    "reportName": "ElectricityInvoice",
    "format": "PDF",
    "fileName": "ElectricityInvoice_1719410000000.pdf",
    "generatedAt": "2025-06-27T10:30:00Z",
    "pageCount": 1,
    "fileSize": 24576
  }
]
```

#### `GET /api/reports/formats`
List supported export formats.

**Response:**
```json
["PDF", "EXCEL", "DOCX", "HTML", "CSV", "XML"]
```

#### `GET /api/reports/templates?utilityType=ELECTRICITY`
List active report templates, optionally filtered by utility type.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Electricity Invoice",
    "code": "elec_invoice",
    "utilityType": "ELECTRICITY",
    "version": 3,
    "isActive": true
  }
]
```

### Template Manager

#### `GET /api/templates`
List all templates.

#### `GET /api/templates/{id}`
Get template by ID.

#### `POST /api/templates`
Create a new template.

**Request:**
```json
{
  "name": "Water Invoice",
  "code": "water_invoice",
  "utilityType": "WATER",
  "description": "Standard water utility invoice",
  "jrxmlContent": "<jasperReport>...</jasperReport>",
  "isActive": true
}
```

#### `PUT /api/templates/{id}`
Update template metadata or JRXML content.

#### `DELETE /api/templates/{id}`
Soft-delete a template.

#### `GET /api/templates/active?utilityType=ELECTRICITY`
Get the currently active template for a utility type.

#### `GET /api/templates/{id}/versions`
List all versions of a template.

#### `POST /api/templates/{id}/versions/{versionNumber}/activate`
Activate a specific version.

#### `POST /api/templates/{id}/assets`
Upload a template asset (image, font, logo, signature, subreport).

**Request:** Multipart form with fields:
- `file` — the file content
- `type` — `IMAGE`, `FONT`, `LOGO`, `SIGNATURE`, or `SUBREPORT`
- `name` — logical asset name

#### `GET /api/templates/{templateId}/assets/{assetId}`
Download an asset by ID.

### Billing Engine

#### `GET /api/billing/invoices`
List invoices with optional filters.

| Parameter      | Type   | Description                       |
|----------------|--------|-----------------------------------|
| `utilityType`  | String | Filter by utility type            |
| `status`       | String | Filter by status                  |
| `customerCode` | String | Filter by customer code           |
| `page`         | int    | Page number (zero-indexed)        |
| `size`         | int    | Page size (default 20)            |

#### `GET /api/billing/invoices/{id}`
Get invoice by UUID.

#### `GET /api/billing/invoices/by-number/{invoiceNumber}`
Get invoice by number.

#### `POST /api/billing/invoices`
Create a new invoice.

**Request:**
```json
{
  "invoiceNumber": "INV-2025-00001",
  "utilityType": "ELECTRICITY",
  "customerCode": "CUST-001",
  "customerName": "Ahmed Mohammed",
  "customerNameAr": "أحمد محمد",
  "meterSerial": "MTR-12345",
  "consumption": 1500.5,
  "unitLabel": "kWh",
  "totalAmount": 450.75,
  "currency": "SAR"
}
```

#### `GET /api/billing/tariffs`
List all tariffs.

#### `GET /api/billing/tariffs/active?utilityType=ELECTRICITY&date=2025-06-01`
Get active tariff for a utility type on a given date.

#### `POST /api/billing/tariffs`
Create a tariff.

**Request:**
```json
{
  "code": "ELEC-RES-2025",
  "name": "Residential Electricity 2025",
  "nameAr": "الكهرباء السكنية 2025",
  "utilityType": "ELECTRICITY",
  "effectiveFrom": "2025-01-01",
  "effectiveTo": "2025-12-31"
}
```

#### `POST /api/billing/calculate`
Calculate charges for a given consumption.

**Request:**
```json
{
  "consumption": 1500.5,
  "utilityType": "ELECTRICITY"
}
```

**Response:**
```json
{
  "utilityType": "ELECTRICITY",
  "consumption": 1500.5,
  "energyCharges": 380.25,
  "fixedCharges": 25.00,
  "totalCharges": 405.25,
  "taxAmount": 60.79,
  "totalAmount": 466.04,
  "currency": "SAR"
}
```

### Bulk Generation

#### `POST /api/bulk/jobs`
Create a bulk generation job.

**Request:**
```json
{
  "utilityType": "ELECTRICITY",
  "format": "PDF",
  "invoiceIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "utilityType": "ELECTRICITY",
  "format": "PDF",
  "totalCount": 2,
  "completedCount": 0,
  "failedCount": 0
}
```

#### `GET /api/bulk/jobs/{jobId}`
Get job status.

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "status": "PROCESSING",
  "totalCount": 2,
  "completedCount": 1,
  "failedCount": 0
}
```

#### `GET /api/bulk/jobs/{jobId}/results`
List all job items with their statuses.

#### `GET /api/bulk/jobs/{jobId}/items/{itemId}/download`
Download a completed job item's report binary.

#### `POST /api/bulk/jobs/{jobId}/process`
Manually trigger processing of a pending job.

#### `POST /api/bulk/jobs/{jobId}/cancel`
Cancel a running job.

### PDF Security

#### `POST /api/security/pdf/protect`
Apply password protection. **Multipart:** `file`, optional `userPassword`, optional `ownerPassword`.

#### `POST /api/security/pdf/unprotect`
Remove password protection. **Multipart:** `file`, `ownerPassword`.

#### `POST /api/security/pdf/disable-editing`
Disable editing via permissions. **Multipart:** `file`.

#### `POST /api/security/pdf/disable-copy`
Disable content copying. **Multipart:** `file`.

#### `POST /api/security/pdf/watermark`
Add a watermark to all pages. **Multipart:** `file`, `text`.

#### `POST /api/security/pdf/sign`
Apply a digital signature. **Multipart:** `file`, `keystore`, `alias`, `password`.

### Health & Metrics

#### `GET /actuator/health`
Standard Spring Boot health check.

#### `GET /actuator/info`
Application info.

#### `GET /actuator/metrics`
Application metrics (JVM, cache, database pool).

#### `GET /actuator/prometheus`
Prometheus-formatted metrics.

#### `GET /actuator/caches`
Cache statistics.

---

## Module Descriptions

### 1. Report Engine (`com.meterverse.reporting.reportengine`)

Core reporting module built on JasperReports 7.0.1.

| Component          | Responsibility                                             |
|--------------------|------------------------------------------------------------|
| `ReportCompiler`   | Compiles `.jrxml` to `JasperReport` with Caffeine caching  |
| `ReportFiller`     | Fills reports from invoices, JDBC connections, or collections |
| `ReportExporter`   | Strategy pattern router to 5 export implementations        |
| `ReportService`    | Orchestrates compile → fill → export pipeline              |
| `PdfExporter`      | PDF export with Arabic/RTL support                         |
| `ExcelExporter`    | XLSX export with auto cell type detection                  |
| `DocxExporter`     | DOCX export with embedded fonts                            |
| `HtmlExporter`     | HTML export with embedded images                           |
| `CsvExporter`      | UTF-8 CSV export                                           |

### 2. Template Manager (`com.meterverse.reporting.templatemanager`)

Lifecycle management for report templates.

| Component                 | Responsibility                                      |
|---------------------------|-----------------------------------------------------|
| `ReportTemplate`          | JPA entity storing JRXML, compiled bytes, and metadata |
| `TemplateVersion`         | Versioned snapshots of JRXML content                |
| `TemplateAsset`           | Images, logos, signatures, fonts, subreports        |
| `TemplateService`         | CRUD, version activation, asset upload              |
| `TemplateVersionManager`  | Version tracking with configurable max versions     |

### 3. Bulk Generation (`com.meterverse.reporting.bulk`)

Asynchronous high-volume report generation via RabbitMQ.

| Component                 | Responsibility                                      |
|---------------------------|-----------------------------------------------------|
| `BulkJob`                 | Job entity tracking total/completed/failed counts   |
| `BulkJobItem`             | Per-invoice job item with result bytes              |
| `BulkGenerationService`   | Job creation, message publishing, cancellation      |
| `BulkGenerationConsumer`  | RabbitMQ listener processing queued generation tasks|

### 4. PDF Security (`com.meterverse.reporting.pdfsecurity`)

Post-generation PDF security operations using iText 9 + BouncyCastle.

| Component              | Responsibility                                  |
|------------------------|-------------------------------------------------|
| `PdfSecurityService`   | Password protect, remove protection, disable editing, disable copy, add watermark, digital sign |

### 5. Billing Engine (`com.meterverse.reporting.billing`)

Domain model and calculation engine for utility billing.

| Component              | Responsibility                                  |
|------------------------|-------------------------------------------------|
| `Invoice`              | Full invoice entity with Arabic name support    |
| `Tariff`               | Tariff definition with effective date ranges    |
| `TariffSlab`           | Tiered pricing slabs (from_unit, to_unit, rate) |
| `InvoiceChargeLine`    | Per-line charge breakdown                       |
| `BillingCalculator`    | Slab-based consumption charge calculation, VAT computation |

### 6. Excel Engine (`com.meterverse.reporting.excelengine`)

JXLS-based Excel generation and Apache POI import.

| Component              | Responsibility                                  |
|------------------------|-------------------------------------------------|
| `JxlsService`          | Generate Excel from JXLS templates with formula evaluation |
| `ExcelImportService`   | Import invoices from Excel with validation      |

### Shared Infrastructure (`com.meterverse.reporting.shared`)

Cross-cutting concerns.

| Component                 | Responsibility                                      |
|---------------------------|-----------------------------------------------------|
| `JasperConfig`            | JasperReportsContext setup, Arabic/ICU4J config     |
| `CacheConfig`             | Caffeine cache manager (reports, templates, invoices) |
| `RabbitMQConfig`          | Quorum queue, direct exchange, JSON message converter |
| `LocaleConfig`            | Arabic-default locale resolver, UTF-8 message source |
| `WebConfig`               | CORS configuration for development and production   |
| `GlobalExceptionHandler`  | Centralised error handling with structured responses |

---

## Development Guide

### Setting Up Jaspersoft Studio

1. Download **Jaspersoft Studio 7.x** from the community site
2. Install the **Meter Verse Font Extension**:
   - Build: `cd jasperreports-fonts-extension && mvn clean package`
   - In Jaspersoft Studio: `Window → Preferences → Jaspersoft Studio → Classpath`
   - Add the built JAR: `jasperreports-fonts-extension/target/meterverse-fonts-1.0.0-jar-with-dependencies.jar`
3. Set workspace default font to **DejaVu Sans** (supports Arabic)
4. Configure template parameters:
   - `INVOICE_ID` – `java.util.UUID`
   - `CUSTOMER_NAME` – `java.lang.String`
   - `TOTAL_AMOUNT` – `java.math.BigDecimal`
   - `REPORT_LOCALE` – `java.util.Locale`

### Creating Template Assets

Place fonts, images, and subreports in the appropriate resource directories:

```
src/main/resources/
├── fonts/              # TTF font files + fonts.xml
├── images/             # Logos, watermarks, etc.
├── i18n/               # messages_en.properties, messages_ar.properties
├── reports/
│   ├── common/         # Shared styles (Styles.jrxml)
│   └── electricity/    # Utility-specific templates
└── templates/          # JXLS Excel templates
```

### Internationalisation

Add label keys to both locale files:

**`src/main/resources/i18n/messages_en.properties`:**
```properties
report.new.key=New Label
```

**`src/main/resources/i18n/messages_ar.properties`:**
```properties
report.new.key=تسمية جديدة
```

Reference in JRXML: `$R{report.new.key}`

### Pre-compiling JRXML

The Maven plugin compiles all `.jrxml` files during `generate-resources` phase:

```bash
mvn generate-resources
```

Compiled output goes to `compiled/` directory.

### Running Without Docker

```bash
# Ensure PostgreSQL and RabbitMQ are running locally
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Adding New Utility Types

### Step 1: Create JRXML Template

```
src/main/resources/reports/{utility}/
└── {Utility}Invoice.jrxml
```

Use existing templates as reference. Import `Styles.jrxml`:
```xml
<import value="reports/common/Styles.jrxml"/>
```

### Step 2: Register Template in Database

Insert a new `report_templates` row via Flyway migration or API:

```json
POST /api/templates
{
  "name": "Gas Invoice",
  "code": "gas_invoice",
  "utilityType": "GAS",
  "description": "Natural gas utility invoice",
  "jrxmlContent": "<jasperReport>...</jasperReport>"
}
```

### Step 3: Add Excel Template (Optional)

```xml
templates/excel/gas_invoice_template.xlsx
```

Update `JxlsService.resolveTemplatePath()`.

### Step 4: Add i18n Labels

```
messages_en.properties → report.gas.title=Gas Invoice
messages_ar.properties → report.gas.title=فاتورة غاز
```

### Step 5: Create Tariff

```json
POST /api/billing/tariffs
{
  "code": "GAS-RES-2025",
  "name": "Residential Gas 2025",
  "utilityType": "GAS",
  "effectiveFrom": "2025-01-01"
}
```

---

## Font Configuration

JasperReports font extension is configured in `src/main/resources/fonts/fonts.xml`:

```xml
<fontFamilies>
    <fontFamily name="DejaVu Sans" pdfEncoding="Identity-H" pdfEmbedded="true">
        <normal><![CDATA[fonts/DejaVuSans.ttf]]></normal>
        <bold><![CDATA[fonts/DejaVuSans-Bold.ttf]]></bold>
        <pdfEncoding>Identity-H</pdfEncoding>
        <pdfEmbedded>true</pdfEmbedded>
        <supportsArabic>true</supportsArabic>
    </fontFamily>
</fontFamilies>
```

### Adding a New Font

1. Place `.ttf` files in `src/main/resources/fonts/`
2. Add `<fontFamily>` entry in `fonts.xml`
3. Rebuild the font extension JAR:
   ```bash
   cd jasperreports-fonts-extension && mvn clean package
   ```
4. Include the JAR on the classpath
5. Reference by name in JRXML: `<font fontName="MyFont"/>`

### System Font Installation (Docker)

The Dockerfile installs DejaVu and other common fonts:

```dockerfile
RUN apk add --no-cache fontconfig ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
    && fc-cache -f -v
```

---

## Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests (with Testcontainers)

```bash
mvn verify
```

Testcontainers automatically provisions PostgreSQL and RabbitMQ containers for integration tests.

### Test Dependencies

- **JUnit 5** — test framework
- **Testcontainers** — PostgreSQL 16 + RabbitMQ containers
- **AssertJ** — fluent assertions
- **ApprovalTests** — golden file testing for report output

### Running Specific Tests

```bash
mvn test -Dtest=ReportServiceTest
```

---

## Production Deployment

### Building the Docker Image

```bash
docker build -t meterverse/reporting-engine:1.0.0 .
```

### Running with Docker Compose (Production)

```bash
export PDF_OWNER_PASSWORD=<secure-password>
export PDF_KEYSTORE_PASSWORD=<keystore-password>
export SPRING_PROFILES_ACTIVE=production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

| Variable                | Required | Default     | Description                     |
|-------------------------|----------|-------------|---------------------------------|
| `DB_HOST`               | Yes      | —           | PostgreSQL host                 |
| `DB_PORT`               | No       | `5432`      | PostgreSQL port                 |
| `DB_NAME`               | Yes      | —           | Database name                   |
| `DB_USER`               | Yes      | —           | Database user                   |
| `DB_PASSWORD`           | Yes      | —           | Database password               |
| `RABBITMQ_HOST`         | Yes      | —           | RabbitMQ host                   |
| `RABBITMQ_PORT`         | No       | `5672`      | RabbitMQ port                   |
| `RABBITMQ_USER`         | Yes      | —           | RabbitMQ username               |
| `RABBITMQ_PASSWORD`     | Yes      | —           | RabbitMQ password               |
| `PDF_OWNER_PASSWORD`    | Yes      | —           | PDF owner password              |
| `PDF_KEYSTORE_PATH`     | No       | `/etc/meterverse/keystore.p12` | PKCS12 keystore path |
| `PDF_KEYSTORE_PASSWORD` | Yes      | —           | Keystore password               |
| `TEMPLATE_STORAGE`      | No       | `~/.meterverse/templates` | Template file storage     |
| `JAVA_OPTS`             | No       | `-Xms512m -Xmx2g -XX:+UseZGC` | JVM arguments          |

### Resource Requirements

| Environment | CPU   | RAM  | Disk    | Concurrent Users |
|-------------|-------|------|---------|------------------|
| Development | 2 Cores | 4 GB | 10 GB | < 10 |
| Staging     | 4 Cores | 8 GB | 50 GB | < 100 |
| Production  | 8 Cores | 16 GB | 200 GB | 1000+ |

---

## Performance Tuning

### JVM Settings

```bash
JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseZGC -XX:MaxGCPauseMillis=50 \
           -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m"
```

### Database Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
      idle-timeout: 300000
      max-lifetime: 1200000
```

Adjust `maximum-pool-size` based on `(core_count × 2) + effective_spindle_count`.

### Report Caching

Caffeine cache configuration (in `CacheConfig.java`):

```java
Caffeine.newBuilder()
    .initialCapacity(50)
    .maximumSize(500)
    .expireAfterWrite(30, TimeUnit.MINUTES)
    .expireAfterAccess(15, TimeUnit.MINUTES)
    .recordStats()
    .softValues();
```

Monitor with `GET /actuator/caches`.

### Bulk Generation

- **Chunk size**: 1000 records per flush
- **Consumer threads**: Start at 5, scale to 20
- **Queue type**: Quorum queue for durability
- **Prefetch count**: 10 messages per consumer

### PostgreSQL Tuning

```sql
-- Recommended PostgreSQL config for reporting workloads
shared_buffers = '4GB'
effective_cache_size = '12GB'
work_mem = '64MB'
maintenance_work_mem = '1GB'
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

---

## Monitoring

### Health Checks

```
GET /api/v1/actuator/health
```

Returns liveness and readiness of:
- Database connectivity
- RabbitMQ connectivity
- Disk space

### Metrics

```
GET /api/v1/actuator/metrics
```

Key metrics to watch:
- `hikaricp.connections.active` — active database connections
- `hikaricp.connections.idle` — idle connections
- `hikaricp.connections.pending` — pending connection requests
- `jvm.memory.used` — JVM heap usage
- `jvm.gc.pause` — GC pause times
- `cache.gets` / `cache.misses` — cache hit ratios
- `spring.rabbitmq.listener` — consumer metrics

### Prometheus

```
GET /api/v1/actuator/prometheus
```

Pre-configured metric tags: `application=meterverse-reporting-engine`.
