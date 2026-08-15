import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/middleware/security.js', () => ({ auditLog: vi.fn() }));

const { validateRow, IMPORT_SCHEMAS, executeImport, createImportJob, MAX_IMPORT_ROWS, detectDuplicateRows, generateTemplate, parseWorkbook } = await import('../../src/services/import-engine.js');

describe('P59-C/LR-3 import engine (Solar Excel ImportJob, MeterVerse-native)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('schema registry covers the three legacy solar import types', () => {
    expect(Object.keys(IMPORT_SCHEMAS)).toEqual(['solar_customers', 'solar_invoices', 'solar_payments']);
  });

  it('validates a good invoice row', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': 'M-001', 'Month': '2026-03', 'Invoice Amount': 120.5 }, 2);
    expect(r.ok).toBe(true);
  });

  it('rejects a row missing required column', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': '', 'Month': '2026-03', 'Invoice Amount': 120.5 }, 2);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("Meter Serial");
  });

  it('rejects non-numeric amount', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': 'M-001', 'Month': '2026-03', 'Invoice Amount': 'abc' }, 2);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("Invoice Amount");
  });

  it('validates solar_customers required Arabic Name + meter serial', () => {
    const ok = validateRow('solar_customers', { 'Arabic Name': 'عميل', 'Meter Serial Electricity': 'E-9' }, 2);
    expect(ok.ok).toBe(true);
    const bad = validateRow('solar_customers', { 'Arabic Name': '', 'Meter Serial Electricity': 'E-9' }, 2);
    expect(bad.ok).toBe(false);
  });

  it('executeImport processes valid rows and records failures', async () => {
    prisma.customer.create.mockResolvedValue({ id: 'c-1' });
    prisma.meter.create.mockResolvedValue({ id: 'm-1' });
    prisma.meter.update.mockResolvedValue({ id: 'm-1', customerId: 'c-1' });
    const rows = [
      { index: 2, data: { 'Arabic Name': 'A', 'Meter Serial Electricity': 'E-1' } },
      { index: 3, data: { 'Arabic Name': '', 'Meter Serial Electricity': 'E-2' } }, // invalid
    ];
    const r = await executeImport('solar_customers', rows, {});
    expect(r.processed).toBe(1);
    expect(r.failed).toBe(1);
    expect(prisma.customer.create).toHaveBeenCalledTimes(1);
  });

  it('executeImport invoice requires an existing meter', async () => {
    prisma.meter.findFirst.mockResolvedValue(null);
    const rows = [{ index: 2, data: { 'Meter Serial': 'GHOST', 'Month': '2026-03', 'Invoice Amount': 10 } }];
    const r = await executeImport('solar_invoices', rows, {});
    expect(r.failed).toBe(1);
    expect(r.results[0].errors[0]).toContain("meter not found");
  });

  it('createImportJob persists preview with row payload (idempotent execution)', async () => {
    prisma.importJob.create.mockResolvedValue({ id: 'job-1', status: 'preview' });
    const job = await createImportJob({ type: 'solar_invoices', fileName: 'x.xlsx', rows: [{ index: 2, data: {} }], errors: [], req: {} });
    expect(prisma.importJob.create).toHaveBeenCalled();
    const payload = JSON.parse(prisma.importJob.create.mock.calls[0][0].data.errors);
    expect(payload.rows).toHaveLength(1);
    expect(job.id).toBe('job-1');
  });

  it('exposes a bounded MAX_IMPORT_ROWS guard', () => {
    expect(MAX_IMPORT_ROWS).toBe(50000);
  });

  it('detectDuplicateRows flags repeated meter serials (first occurrence wins)', () => {
    const rows = [
      { index: 2, data: { 'Meter Serial': 'M-1', 'Month': '2026-03', 'Invoice Amount': 10 } },
      { index: 3, data: { 'Meter Serial': 'M-2', 'Month': '2026-03', 'Invoice Amount': 20 } },
      { index: 4, data: { 'Meter Serial': 'M-1', 'Month': '2026-04', 'Invoice Amount': 30 } },
    ];
    const d = detectDuplicateRows('solar_invoices', rows);
    expect(d.has(4)).toBe(true);
    expect(d.get(4)).toBe(2); // duplicate of row 2
    expect(d.size).toBe(1);
  });

  it('executeImport skips duplicate rows as status=duplicate', async () => {
    prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
    prisma.meter.findFirst.mockResolvedValue({ id: 'm-1', customerId: 'c-1' });
    prisma.invoice.create.mockResolvedValue({});
    const rows = [
      { index: 2, data: { 'Meter Serial': 'M-1', 'Month': '2026-03', 'Invoice Amount': 10 } },
      { index: 3, data: { 'Meter Serial': 'M-1', 'Month': '2026-04', 'Invoice Amount': 20 } },
    ];
    const r = await executeImport('solar_invoices', rows, {});
    expect(r.processed).toBe(1);
    expect(r.failed).toBe(1);
    expect(r.results.find(x => x.status === 'duplicate')).toBeDefined();
    expect(prisma.invoice.create).toHaveBeenCalledTimes(1);
  });

  it('executeImport applies each row in a transaction (per-row atomicity)', async () => {
    prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
    prisma.customer.create.mockResolvedValue({ id: 'c-1' });
    prisma.meter.create.mockResolvedValue({ id: 'm-1' });
    prisma.meter.update.mockResolvedValue({});
    const rows = [
      { index: 2, data: { 'Arabic Name': 'A', 'Meter Serial Electricity': 'E-1' } },
      { index: 3, data: { 'Arabic Name': 'B', 'Meter Serial Electricity': 'E-2' } },
    ];
    const r = await executeImport('solar_customers', rows, {});
    expect(r.processed).toBe(2);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2); // one tx per row
  });

  it('P60.1: generateTemplate creates a workbook for each import type (fillable download)', async () => {
    const { write } = await import('xlsx');
    for (const type of Object.keys(IMPORT_SCHEMAS)) {
      const wb = generateTemplate(type);
      expect(wb).toBeDefined();
      expect(wb.SheetNames).toEqual([IMPORT_SCHEMAS[type].sheet]);
      const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
      expect(buf.byteLength).toBeGreaterThan(5000);
    }
  });

  it('P60.1: generateTemplate round-trips into parseWorkbook (template matches parser)', async () => {
    const { write } = await import('xlsx');
    for (const type of Object.keys(IMPORT_SCHEMAS)) {
      const wb = generateTemplate(type);
      const buf = write(wb, { type: 'buffer', bookType: 'xlsx' });
      const p = parseWorkbook(buf, type);
      expect(p.ok).toBe(true);
      expect(p.errors).toEqual([]);
    }
  });

  it('P60.1: generateTemplate rejects unknown import type', () => {
    expect(() => generateTemplate('bogus')).toThrow(/Unknown import type/);
  });
});
