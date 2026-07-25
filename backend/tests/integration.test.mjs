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

  // ─── T026: SIM Reuse Lifecycle ───
  it('T026: POST /api/sim — 201 create SIM (available)', async () => {
    const ts = Date.now();
    const r = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000000${ts}`, simNumber: `SIM-T026-A-${ts}`, operator: 'Vodafone' }) });
    expect(r.status).toBe(201);
  });

  it('T026: GET /api/sim/:id/eligibility — 200 eligible initially', async () => {
    const ts = Date.now();
    const sim = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000001${ts}`, simNumber: `SIM-T026-B-${ts}` }) }).then(r => r.json());
    const simId = sim.sim?.id || sim.id;
    const r = await fetch(`${BASE}/api/sim/${simId}/eligibility`, { headers: AUTH });
    const body = await r.json();
    expect(r.status).toBe(200);
    expect(body.eligible).toBe(true);
  });

  it('T026: POST /api/sim/:id/assign + eligibility flips to false', async () => {
    const ts = Date.now();
    const sim = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000002${ts}`, simNumber: `SIM-T026-C-${ts}` }) }).then(r => r.json());
    const simId = sim.sim?.id || sim.id;
    const mtr = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: `T026-MTR-C-${ts}`, type: 'electric', status: 'active' }) }).then(r => r.json());
    const mtrId = mtr.meter?.id || mtr.id;

    // Assign
    const a = await fetch(`${BASE}/api/sim/${simId}/assign`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrId }) });
    expect(a.status).toBe(201);

    // Eligibility should now be false
    const e = await fetch(`${BASE}/api/sim/${simId}/eligibility`, { headers: AUTH });
    const eBody = await e.json();
    expect(eBody.eligible).toBe(false);
  });

  it('T026: POST /api/sim/:id/release + eligibility flips back to true (reuse)', async () => {
    const ts = Date.now();
    const sim = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000003${ts}`, simNumber: `SIM-T026-D-${ts}` }) }).then(r => r.json());
    const simId = sim.sim?.id || sim.id;
    const mtr = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: `T026-MTR-D-${ts}`, type: 'electric', status: 'active' }) }).then(r => r.json());
    const mtrId = mtr.meter?.id || mtr.id;

    // Assign
    await fetch(`${BASE}/api/sim/${simId}/assign`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrId }) });
    // Release
    const r = await fetch(`${BASE}/api/sim/${simId}/release`, { method: 'POST', headers: AUTH });
    expect(r.status).toBe(200);

    // Eligibility should be true again
    const e = await fetch(`${BASE}/api/sim/${simId}/eligibility`, { headers: AUTH });
    const eBody = await e.json();
    expect(eBody.eligible).toBe(true);
  });

  it('T026: POST /api/sim/:id/assign — reassign after release (reuse)', async () => {
    const ts = Date.now();
    const sim = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000004${ts}`, simNumber: `SIM-T026-E-${ts}` }) }).then(r => r.json());
    const simId = sim.sim?.id || sim.id;
    const mtrA = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: `T026-MTR-E1-${ts}`, type: 'electric', status: 'active' }) }).then(r => r.json());
    const mtrAId = mtrA.meter?.id || mtrA.id;
    const mtrB = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: `T026-MTR-E2-${ts}`, type: 'electric', status: 'active' }) }).then(r => r.json());
    const mtrBId = mtrB.meter?.id || mtrB.id;

    // Assign to meter A
    await fetch(`${BASE}/api/sim/${simId}/assign`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrAId }) });
    // Release
    await fetch(`${BASE}/api/sim/${simId}/release`, { method: 'POST', headers: AUTH });
    // Reassign to meter B
    const r = await fetch(`${BASE}/api/sim/${simId}/assign`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: mtrBId }) });
    expect(r.status).toBe(201);
  });

  it('T026: POST /api/sim/:id/assign — 404 for missing SIM', async () => {
    const r = await fetch(`${BASE}/api/sim/nonexistent-sim-id/assign`, { method: 'POST', headers: AUTH, body: JSON.stringify({ meterId: '00000000-0000-0000-0000-000000000000' }) });
    expect(r.status).toBe(404);
  });

  it('T026: POST /api/sim/:id/release — 404 for missing SIM', async () => {
    const r = await fetch(`${BASE}/api/sim/nonexistent-sim-id/release`, { method: 'POST', headers: AUTH });
    expect(r.status).toBe(404);
  });

  it('T026: POST /api/sim/:id/release — 400 for unassigned SIM', async () => {
    const ts = Date.now();
    const sim = await fetch(`${BASE}/api/sim`, { method: 'POST', headers: AUTH, body: JSON.stringify({ iccid: `8900000005${ts}`, simNumber: `SIM-T026-F-${ts}` }) }).then(r => r.json());
    const simId = sim.sim?.id || sim.id;
    const r = await fetch(`${BASE}/api/sim/${simId}/release`, { method: 'POST', headers: AUTH });
    expect(r.status).toBe(400);
  });

  // ─── T027: Projects Module ───
  it('T027: full CRUD lifecycle via /api/projects', async () => {
    // Create org first (required for project FK)
    const ts = Date.now();
    const org = await fetch(`${BASE}/api/admin/organizations`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: `T027-Org-${ts}`, slug: `t027-org-${ts}` }) }).then(r => r.json());
    const orgId = org.organization?.id || org.id;
    expect(orgId).toBeTruthy();

    // Create project
    const p = await fetch(`${BASE}/api/projects`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: `T027 Project ${ts}`, description: 'Integration test', organizationId: orgId }) }).then(r => r.json());
    const projId = p.project?.id || p.id;
    expect(projId).toBeTruthy();

    // GET by id
    const g = await fetch(`${BASE}/api/projects/${projId}`, { headers: AUTH }).then(r => r.json());
    expect(g.project.name).toContain('T027 Project');
    expect(g.project._count.zones).toBe(0);

    // Update
    const u = await fetch(`${BASE}/api/projects/${projId}`, { method: 'PUT', headers: AUTH, body: JSON.stringify({ description: 'Updated desc' }) }).then(r => r.json());
    expect(u.project.description).toBe('Updated desc');

    // Stats
    const s = await fetch(`${BASE}/api/projects/stats`, { headers: AUTH }).then(r => r.json());
    expect(s.stats.total).toBeGreaterThanOrEqual(1);

    // Delete (archive)
    const d = await fetch(`${BASE}/api/projects/${projId}`, { method: 'DELETE', headers: AUTH }).then(r => r.json());
    expect(d.project.status).toBe('inactive');
    expect(d.project.archivedAt).toBeTruthy();

    // Restore
    const r = await fetch(`${BASE}/api/projects/${projId}/restore`, { method: 'POST', headers: AUTH }).then(r => r.json());
    expect(r.project.status).toBe('active');
    expect(r.project.archivedAt).toBeNull();
  });

  it('T027: admin routes mirror projects routes', async () => {
    const ts = Date.now();
    const org = await fetch(`${BASE}/api/admin/organizations`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: `T027-Adm-Org-${ts}`, slug: `t027-adm-org-${ts}` }) }).then(r => r.json());
    const orgId = org.organization?.id || org.id;
    const p = await fetch(`${BASE}/api/admin/projects`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: `T027 Admin Proj ${ts}`, description: 'Admin test', organizationId: orgId }) }).then(r => r.json());
    const projId = p.project?.id || p.id;
    expect(projId).toBeTruthy();

    // List via admin
    const list = await fetch(`${BASE}/api/admin/projects?page=1&limit=10`, { headers: AUTH }).then(r => r.json());
    expect(Array.isArray(list.projects)).toBe(true);

    // Get by id via admin
    const g = await fetch(`${BASE}/api/admin/projects/${projId}`, { headers: AUTH }).then(r => r.json());
    expect(g.project.id).toBe(projId);

    // Update via admin
    const u = await fetch(`${BASE}/api/admin/projects/${projId}`, { method: 'PUT', headers: AUTH, body: JSON.stringify({ description: 'Admin updated' }) }).then(r => r.json());
    expect(u.project.description).toBe('Admin updated');

    // Archive via admin
    const d = await fetch(`${BASE}/api/admin/projects/${projId}`, { method: 'DELETE', headers: AUTH }).then(r => r.json());
    expect(d.project.status).toBe('inactive');

    // Restore via admin
    const r = await fetch(`${BASE}/api/admin/projects/${projId}/restore`, { method: 'POST', headers: AUTH }).then(r => r.json());
    expect(r.project.status).toBe('active');
  });
});
