-- Derived views for MeterVerse
-- Run: npx prisma db push or psql -d meter_pulse -f prisma/views.sql

-- Customer statement view: aggregates invoices + payments per customer
CREATE OR REPLACE VIEW customer_statement_view AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  c.email,
  COUNT(DISTINCT i.id) AS invoice_count,
  COALESCE(SUM(i.amount), 0) AS total_billed,
  COALESCE(COUNT(i.id) FILTER (WHERE i.status = 'paid'), 0) AS paid_count,
  COALESCE(SUM(i.amount) FILTER (WHERE i.status != 'paid'), 0) AS outstanding_balance,
  MAX(i."dueDate") AS latest_due_date,
  COUNT(DISTINCT CASE WHEN i.status = 'overdue' THEN i.id END) AS overdue_count
FROM "Customer" c
LEFT JOIN "Invoice" i ON i."customerId" = c.id
GROUP BY c.id, c.name, c.email;

-- Active meter assignments view
CREATE OR REPLACE VIEW active_assignment_view AS
SELECT
  ma.id AS assignment_id,
  m.id AS meter_id,
  m.serial AS meter_serial,
  m.type AS meter_type,
  c.id AS customer_id,
  c.name AS customer_name,
  ma."createdAt" AS start_date,
  NULL AS end_date,
  'active' AS status
FROM "MeterAssignment" ma
JOIN "Meter" m ON m.id = ma."meterId"
LEFT JOIN "Customer" c ON c.id = ma."customerId"
WHERE ma.status = 'active';

-- SIM assignment view
CREATE OR REPLACE VIEW sim_assignment_active_view AS
SELECT
  sa.id AS assignment_id,
  s.id AS sim_id,
  s."simNumber",
  s.iccid,
  s.status AS sim_status,
  m.id AS meter_id,
  m.serial AS meter_serial,
  sa."startAt",
  sa."endAt",
  CASE WHEN sa."endAt" IS NULL THEN 'active' ELSE 'ended' END AS assignment_status
FROM "SIMAssignment" sa
JOIN "SIMCard" s ON s.id = sa."simId"
LEFT JOIN "Meter" m ON m.id = sa."meterId";
