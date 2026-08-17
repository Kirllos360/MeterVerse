process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/meter_pulse';
process.env.PDF_OUTPUT_DIR = 'C:/Users/EPower/AppData/Local/Temp/opencode/real-invoice-pdf';
const fs = await import('node:fs');
const path = await import('node:path');
const { PrismaClient } = await import('@prisma/client');
const { generateInvoicePdf } = await import('../src/services/pdf-engine.js');
const { PDFParse } = await import('pdf-parse');

const prisma = new PrismaClient();
try {
  const invoice = await prisma.invoice.findUnique({
    where: { number: 'SOLAR-52051449-2021-01' },
    include: { customer: true },
  });
  if (!invoice) throw new Error('real invoice not found');
  console.log('REAL INVOICE:', invoice.number, invoice.amount, '| customer:', invoice.customer.name);

  const result = await generateInvoicePdf(invoice, invoice.customer);
  console.log('PDF written:', result.filepath, fs.statSync(result.filepath).size, 'bytes');

  const parser = new PDFParse({ data: fs.readFileSync(result.filepath) });
  const data = await parser.getText();
  const text = Array.isArray(data) ? data.join('\n') : (data?.text ?? JSON.stringify(data));
  const checks = {
    '36.10 rendered': text.includes('36.10'),
    'invoice number': text.includes('SOLAR-52051449-2021-01'),
    'customer name': text.includes('Ihab Shafie') || text.includes('شافعي'),
    'status issued': text.includes('issued'),
  };
  console.log('PDF VERIFY:', JSON.stringify(checks));
  if (!Object.values(checks).every(Boolean)) { console.log('RAW TEXT:', text.slice(0, 300)); process.exit(2); }
  console.log('REAL PDF CERTIFIED');
} finally {
  await prisma.$disconnect();
}