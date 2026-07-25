import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3002';
const AUTH = { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true', 'Content-Type': 'application/json' };
const GET = (url) => fetch(`${BASE}${url}`, { headers: AUTH }).then(r => ({ status: r.status, body: r.json() }));
const POST = (url, body) => fetch(`${BASE}${url}`, { method: 'POST', headers: AUTH, body: JSON.stringify(body) }).then(r => ({ status: r.status, body: r.json() }));

const backendReady = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) })
  .then(r => r.status === 200).catch(() => false);

const describeFn = backendReady ? describe : describe.skip;

describeFn('API Integration Tests', () => {

  it('should reject unauthenticated requests', async () => {
    const res = await fetch(`${BASE}/api/customers`);
    expect(res.status).toBe(401);
  });

  it('should have health endpoint', async () => {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });

  // ─── T025: Assignment Conflict Detection ───
  it('T025: POST /api/meter-assignments — 201 create assignment', async () => {
    // Create customer
    const cRes = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T025-Customer-A', email: 't025a@test.com' }) });
    expect(cRes.status).toBe(201);
    const customer = await cRes.json();
    const customerId = customer.customer?.id || customer.id;

    // Create meter
    const mRes = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'T025-MTR-A-' + Date.now(), type: 'electric', status: 'active' }) });
    expect(mRes.status).toBe(201);
    const meter = await mRes.json();
    const meterId = meter.meter?.id || meter.id;

    // Assign
    const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId, customerId }) });
    expect(r.status).toBe(201);
  });

  it('T025: POST /api/meter-assignments — 409 same meter to different customer', async () => {
    // Create customer A + meter, assign
    const cA = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T025-Customer-A2', email: 't025a2@test.com' }) }).then(r => r.json());
    const cAId = cA.customer?.id || cA.id;
    const mtr = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'T025-MTR-B-' + Date.now(), type: 'electric', status: 'active' }) }).then(r => r.json());
    const mtrId = mtr.meter?.id || mtr.id;
    await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrId, customerId: cAId }) });
    // Create customer B
    const cB = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T025-Customer-B', email: 't025b@test.com' }) }).then(r => r.json());
    const cBId = cB.customer?.id || cB.id;
    // Assign same meter to customer B → 409
    const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrId, customerId: cBId }) });
    expect(r.status).toBe(409);
  });

  it('T025: POST /api/meter-assignments — 404 for nonexistent meter', async () => {
    const c = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'T025-Customer-C', email: 't025c@test.com' }) }).then(r => r.json());
    const cId = c.customer?.id || c.id;
    const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: '00000000-0000-0000-0000-000000000000', customerId: cId }) });
    expect(r.status).toBe(404);
  });

  it('T025: POST /api/meter-assignments — 404 for nonexistent customer', async () => {
    const m = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'T025-MTR-D-' + Date.now(), type: 'electric', status: 'active' }) }).then(r => r.json());
    const mId = m.meter?.id || m.id;
    const r = await fetch(`${BASE}/api/meter-assignments`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mId, customerId: '00000000-0000-0000-0000-000000000000' }) });
    expect(r.status).toBe(404);
  });
});
