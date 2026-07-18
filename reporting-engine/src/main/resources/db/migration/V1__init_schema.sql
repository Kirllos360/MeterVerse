-- Meter Verse Reporting Engine - Initial Schema
-- PostgreSQL 16

-- ============================================================
-- BILLING MODULE
-- ============================================================

CREATE TABLE tariffs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    name_ar         VARCHAR(200),
    utility_type    VARCHAR(50) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tariff_slabs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tariff_id       UUID NOT NULL REFERENCES tariffs(id) ON DELETE CASCADE,
    from_unit       DOUBLE PRECISION NOT NULL DEFAULT 0,
    to_unit         DOUBLE PRECISION,
    rate            DECIMAL(18,6) NOT NULL,
    fixed_charge    DECIMAL(18,3) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'EGP',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tariff_slabs_tariff ON tariff_slabs(tariff_id);
CREATE INDEX idx_tariffs_utility_active ON tariffs(utility_type, is_active);

CREATE TABLE invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number      VARCHAR(100) NOT NULL UNIQUE,
    invoice_title       VARCHAR(200),
    utility_type        VARCHAR(50) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    customer_id         UUID,
    customer_code       VARCHAR(100),
    customer_name       VARCHAR(300),
    customer_name_ar    VARCHAR(300),
    meter_serial        VARCHAR(100),
    meter_type          VARCHAR(100),
    project_name        VARCHAR(300),
    area_name           VARCHAR(200),
    unit_number         VARCHAR(100),
    address             TEXT,
    issue_date          DATE,
    due_date            DATE,
    billing_period      VARCHAR(100),
    start_reading       DOUBLE PRECISION,
    end_reading         DOUBLE PRECISION,
    consumption         DOUBLE PRECISION,
    unit_label          VARCHAR(50),
    balance_before      DECIMAL(18,3) DEFAULT 0,
    current_charges     DECIMAL(18,3) DEFAULT 0,
    adjustments         DECIMAL(18,3) DEFAULT 0,
    payments            DECIMAL(18,3) DEFAULT 0,
    balance_after       DECIMAL(18,3) DEFAULT 0,
    subtotal            DECIMAL(18,3) DEFAULT 0,
    tax_amount          DECIMAL(18,3) DEFAULT 0,
    total_amount        DECIMAL(18,3) DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EGP',
    company_name        VARCHAR(300),
    company_name_ar     VARCHAR(300),
    company_license     VARCHAR(500),
    language            VARCHAR(10) NOT NULL DEFAULT 'ar',
    generated_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version             INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE invoice_charge_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    charge_code     VARCHAR(50),
    charge_name     VARCHAR(200),
    charge_name_ar  VARCHAR(200),
    charge_group    INTEGER NOT NULL DEFAULT 0,
    quantity        DOUBLE PRECISION NOT NULL DEFAULT 1,
    rate_amount     DECIMAL(18,6) DEFAULT 0,
    line_amount     DECIMAL(18,3) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charge_lines_invoice ON invoice_charge_lines(invoice_id);
CREATE INDEX idx_invoices_utility_status ON invoices(utility_type, status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- ============================================================
-- TEMPLATE MANAGER MODULE
-- ============================================================

CREATE TABLE report_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(100) NOT NULL UNIQUE,
    utility_type    VARCHAR(50) NOT NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    description     TEXT,
    jrxml_content   TEXT NOT NULL,
    jasper_bytes    BYTEA,
    parameters_json TEXT,
    styles_json     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE template_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    asset_type      VARCHAR(50) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    file_name       VARCHAR(500),
    mime_type       VARCHAR(100),
    content         BYTEA,
    file_size       BIGINT DEFAULT 0,
    checksum        VARCHAR(64),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE template_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    jrxml_content   TEXT NOT NULL,
    jasper_bytes    BYTEA,
    change_log      TEXT,
    created_by      VARCHAR(200),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(template_id, version_number)
);

CREATE INDEX idx_template_assets_template ON template_assets(template_id);
CREATE INDEX idx_template_versions_template ON template_versions(template_id);

-- ============================================================
-- BULK GENERATION MODULE
-- ============================================================

CREATE TABLE bulk_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    utility_type    VARCHAR(50),
    report_format   VARCHAR(20) NOT NULL DEFAULT 'PDF',
    total_count     INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0,
    failed_count    INTEGER NOT NULL DEFAULT 0,
    error_log       TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_by      VARCHAR(200)
);

CREATE TABLE bulk_job_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES bulk_jobs(id) ON DELETE CASCADE,
    invoice_id      UUID,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    error_message   TEXT,
    result_bytes    BYTEA,
    file_size       BIGINT DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bulk_items_job ON bulk_job_items(job_id);
CREATE INDEX idx_bulk_jobs_status ON bulk_jobs(status);
