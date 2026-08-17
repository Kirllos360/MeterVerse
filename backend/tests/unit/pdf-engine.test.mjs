import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PDFParse } from 'pdf-parse';

process.env.PDF_OUTPUT_DIR = path.join(os.tmpdir(), 'meterverse-pdf-test');

const { generateInvoicePdf, generateStatementPdf } = await import('../../src/services/pdf-engine.js');

describe('P13.6 pdf-engine (invoice/statement document generation)', () => {
  beforeAll(() => {
    if (!fs.existsSync(process.env.PDF_OUTPUT_DIR)) fs.mkdirSync(process.env.PDF_OUTPUT_DIR, { recursive: true });
  });

  afterAll(() => {
    try { fs.rmSync(process.env.PDF_OUTPUT_DIR, { recursive: true, force: true }); } catch {}
  });

  const invoice = {
    id: 'inv-0001', number: 'SOLAR-52051449-2021-01', amount: 36.10,
    status: 'issued', createdAt: new Date('2021-01-31'), dueDate: new Date('2021-03-01'),
  };
  const customer = { id: 'c-1', name: 'Ihab Shafie', email: 'ihab@example.com' };

  it('1. generates a real, parseable PDF file for an invoice', async () => {
    const { filepath, filename } = await generateInvoicePdf(invoice, customer);
    expect(filename).toBe('invoice-SOLAR-52051449-2021-01.pdf');
    expect(fs.existsSync(filepath)).toBe(true);
    const head = fs.readFileSync(filepath).subarray(0, 5).toString('ascii');
    expect(head).toBe('%PDF-');
    expect(fs.statSync(filepath).size).toBeGreaterThan(500);
  });

  it('2. rendered text contains amount, number and customer (parser validation)', async () => {
    const { filepath } = await generateInvoicePdf(invoice, customer);
    const parser = new PDFParse({ data: fs.readFileSync(filepath) });
    const data = await parser.getText();
    const text = Array.isArray(data) ? data.join('\n') : (data?.text ?? JSON.stringify(data));
    expect(text).toContain('36.10');
    expect(text).toContain('SOLAR-52051449-2021-01');
    expect(text).toContain('Ihab Shafie');
  });

  it('3. generates a real customer statement PDF', async () => {
    const { filepath, filename } = await generateStatementPdf(customer, [invoice], [], 36.10);
    expect(filename).toBe('statement-c-1.pdf');
    expect(fs.existsSync(filepath)).toBe(true);
    expect(fs.readFileSync(filepath).subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(fs.statSync(filepath).size).toBeGreaterThan(500);
  });

  it('4. statement PDF text includes invoice history lines', async () => {
    const { filepath } = await generateStatementPdf(customer, [invoice], [], 36.10);
    const parser = new PDFParse({ data: fs.readFileSync(filepath) });
    const data = await parser.getText();
    const text = Array.isArray(data) ? data.join('\n') : (data?.text ?? JSON.stringify(data));
    expect(text).toContain('CUSTOMER STATEMENT');
    expect(text).toContain('Ihab Shafie');
    expect(text).toContain('36.10');
  });
});
