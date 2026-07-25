// Area DB Template — bootstrap new area with 45 tables (T088)
import { execSync } from 'child_process';

const TEMPLATE_SQL = `
-- Area Template: Creates schema and core tables for a new area
CREATE SCHEMA IF NOT EXISTS area_template;
SET search_path TO area_template;

-- Metering core
CREATE TABLE meters (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), serial TEXT UNIQUE, type TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE readings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meter_id UUID REFERENCES meters(id), value NUMERIC, unit TEXT DEFAULT 'kWh', timestamp TIMESTAMPTZ DEFAULT now());
CREATE TABLE tariffs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, rate NUMERIC);

-- Customers
CREATE TABLE customers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, email TEXT, status TEXT DEFAULT 'active');
CREATE TABLE assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meter_id UUID REFERENCES meters(id), customer_id UUID REFERENCES customers(id), status TEXT DEFAULT 'active');

-- Billing
CREATE TABLE invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), customer_id UUID REFERENCES customers(id), amount NUMERIC, status TEXT DEFAULT 'pending');
CREATE TABLE payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), customer_id UUID REFERENCES customers(id), amount NUMERIC, method TEXT);

-- SIM management
CREATE TABLE sim_cards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), iccid TEXT UNIQUE, status TEXT DEFAULT 'available');
CREATE TABLE sim_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sim_id UUID REFERENCES sim_cards(id), meter_id UUID REFERENCES meters(id));
`;

export function generateAreaTemplate(areaName) {
  const sql = TEMPLATE_SQL.replace(/area_template/g, `${areaName}_schema`);
  return sql;
}

if (process.argv[2]) {
  const sql = generateAreaTemplate(process.argv[2]);
  console.log(sql);
}
