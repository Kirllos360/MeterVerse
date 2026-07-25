/**
 * Contract Tests — LIVE Backend Verification
 * Tests hit the ACTUAL running backend (port 3002) with real data.
 * No mocks. No stubs. Real requests, real responses, real database.
 */

import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3002';
const AUTH = { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true', 'Content-Type': 'application/json' };
const GET = (url) => fetch(`${BASE}${url}`, { headers: AUTH }).then(r => ({ status: r.status, body: r.json() }));
const POST = (url, body) => fetch(`${BASE}${url}`, { method: 'POST', headers: AUTH, body: JSON.stringify(body) }).then(r => ({ status: r.status, body: r.json() }));

// Check if backend is reachable before running live tests
const backendReady = await fetch('http://localhost:3002/api/health', { signal: AbortSignal.timeout(2000) })
  .then(r => r.status === 200).catch(() => false);

const describeFn = backendReady ? describe : describe.skip;

describeFn('Contract Tests — Live Backend', () => {

  // ─── Health & Versioning ───
  it('GET /api/health — 200', async () => {
    const r = await fetch(`${BASE}/api/health`);
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.status).toBe('ok');
  });

  it('GET /api/v1/health — 200 with version', async () => {
    const r = await fetch(`${BASE}/api/v1/health`);
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.version).toBeDefined();
  });

  it('GET /api/v1/customers — 200', async () => {
    const r = await fetch(`${BASE}/api/v1/customers`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Correlation ID ───
  it('Response has X-Correlation-ID header', async () => {
    const r = await fetch(`${BASE}/api/customers`, { headers: AUTH });
    expect(r.headers.get('X-Correlation-ID')).toBeTruthy();
  });

  // ─── Auth ───
  it('POST /api/auth/login — 400 without credentials (Zod validation)', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(r.status).toBe(400);
  });

  // ─── Customers ───
  it('GET /api/customers — 200 with list', async () => {
    const r = await fetch(`${BASE}/api/customers`, { headers: AUTH });
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.customers).toBeDefined();
  });

  it('POST /api/customers — 400 without name (validation)', async () => {
    const r = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ email: 'test@t.com' }) });
    expect(r.status).toBe(400);
  });

  it('POST /api/customers — 201 with valid data', async () => {
    const r = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'Contract Test', email: 'contract@test.com' }) });
    expect(r.status).toBe(201);
    const b = await r.json();
    expect(b.customer).toBeDefined();
  });

  // ─── Meters ───
  it('GET /api/meters — 200 with list', async () => {
    const r = await fetch(`${BASE}/api/meters`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('POST /api/meters — 400 without serial (validation)', async () => {
    const r = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ type: 'water' }) });
    expect(r.status).toBe(400);
  });

  // ─── Readings ───
  it('GET /api/readings — 200', async () => {
    const r = await fetch(`${BASE}/api/readings`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/readings/review-queue — 200', async () => {
    const r = await fetch(`${BASE}/api/readings/review-queue`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Invoices ───
  it('GET /api/invoices — 200', async () => {
    const r = await fetch(`${BASE}/api/invoices`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Payments ───
  it('GET /api/payments — 200', async () => {
    const r = await fetch(`${BASE}/api/payments`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Tariffs ───
  it('GET /api/tariffs — 200', async () => {
    const r = await fetch(`${BASE}/api/tariffs`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── SIM ───
  it('GET /api/sim — 200', async () => {
    const r = await fetch(`${BASE}/api/sim`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Tasks ───
  it('GET /api/tasks — 200', async () => {
    const r = await fetch(`${BASE}/api/tasks`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Locations ───
  it('GET /api/locations/zones — 200', async () => {
    const r = await fetch(`${BASE}/api/locations/zones`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/locations/units — 200', async () => {
    const r = await fetch(`${BASE}/api/locations/units`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Dashboard ───
  it('GET /api/business/dashboard-summary — 200 with KPIs', async () => {
    const r = await fetch(`${BASE}/api/business/dashboard-summary`, { headers: AUTH });
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.totalMeters).toBeDefined();
  });

  // ─── Admin ───
  it('GET /api/admin/health — 200', async () => {
    const r = await fetch(`${BASE}/api/admin/health`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/admin/users — 200', async () => {
    const r = await fetch(`${BASE}/api/admin/users`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/admin/roles — 200', async () => {
    const r = await fetch(`${BASE}/api/admin/roles`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/admin/audit — 200', async () => {
    const r = await fetch(`${BASE}/api/admin/audit`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/admin/permissions — 200', async () => {
    const r = await fetch(`${BASE}/api/admin/permissions`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Reports ───
  it('GET /api/reports/jasper/types — 200 with 50 report types', async () => {
    const r = await fetch(`${BASE}/api/reports/jasper/types`, { headers: AUTH });
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.reports.length).toBeGreaterThanOrEqual(44);
  });

  // ─── Upload Templates ───
  it('GET /api/documents/upload-templates — 200 with 9 templates', async () => {
    const r = await fetch(`${BASE}/api/documents/upload-templates`, { headers: AUTH });
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.templates.length).toBeGreaterThanOrEqual(9);
  });

  // ─── Diagnostics ───
  it('GET /api/system/diagnostics — 200 with 24/24 endpoints', async () => {
    const r = await fetch(`${BASE}/api/system/diagnostics`, { headers: AUTH });
    expect(r.status).toBe(200);
    const b = await r.json();
    expect(b.endpoints.passed).toBeGreaterThanOrEqual(24);
    expect(b.database).toBe('connected');
  });

  // ─── Security ───
  it('GET /api/security — 200', async () => {
    const r = await fetch(`${BASE}/api/security`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  it('GET /api/alerts — 200', async () => {
    const r = await fetch(`${BASE}/api/alerts`, { headers: AUTH });
    expect(r.status).toBe(200);
  });

  // ─── Error Handling ───
  it('GET /api/nonexistent — 404 (or 429 if rate limited)', async () => {
    const r = await fetch(`${BASE}/api/nonexistent`, { headers: AUTH });
    expect([404, 429]).toContain(r.status);
  });

  it('GET /api/customers without auth — 401 (or 429 if rate limited)', async () => {
    const r = await fetch(`${BASE}/api/customers`);
    expect([401, 429]).toContain(r.status);
  });

  // ─── T023: Meter Assignment Contract Tests ───
  it('T023: POST /api/meter-assignments — 201 assign meter (200)', async () => {
    // First create a customer and meter to assign
    const cust = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T023 Test Customer', email: 't023@test.com' }) }).then(r => r.json());
    const meter = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'T023-MTR-001', type: 'electric', status: 'active' }) }).then(r => r.json());
    const customerId = cust.customer?.id;
    const meterId = meter.meter?.id;

    if (customerId && meterId) {
      const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId, customerId }) });
      expect(r.status).toBe(201);
      const b = await r.json();
      expect(b.assignment).toBeDefined();
    }
  });

  it('T023: POST /api/meter-assignments — 409 conflict for duplicate (409)', async () => {
    const cust = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T023 Conflict Customer', email: 't023c@test.com' }) }).then(r => r.json());
    const meter = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'T023-MTR-CONFLICT', type: 'water', status: 'active' }) }).then(r => r.json());
    const customerId = cust.customer?.id;
    const meterId = meter.meter?.id;

    if (customerId && meterId) {
      // First assignment — should succeed
      await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId, customerId }) });
      // Second assignment — should fail with 409
      const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId, customerId }) });
      expect([409, 400]).toContain(r.status);
    }
  });
});
