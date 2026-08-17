const BASE = 'http://localhost:3131';
const run = async () => {
  const lr = await fetch(BASE + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meterverse.com', password: 'Admin@123' }),
  });
  const tok = (await lr.json()).accessToken;
  const H = { authorization: 'Bearer ' + tok, 'content-type': 'application/json' };

  // Customer
  const c = await fetch(BASE + '/api/customers/f881de8e-5d61-4b93-bbdc-ffb70fac4441', { headers: H }).then(r => r.json());
  const cust = c.customer || c;
  console.log('CUSTOMER:', cust.name, '| status:', cust.status);

  // Meter (search)
  const m = await fetch(BASE + '/api/meters?search=52051449', { headers: H }).then(r => r.json());
  const meter = m.meters?.[0];
  console.log('METER:', meter?.serial, '| type:', meter?.type, '| customerId:', meter?.customerId?.slice(0, 8));

  // Invoice
  const i = await fetch(BASE + '/api/invoices/22cc2e45-d615-4f98-90d4-76098fea2aac', { headers: H }).then(r => r.json());
  const inv = i.invoice;
  console.log('INVOICE:', inv?.number, '| amount:', inv?.amount, '| status:', inv?.status, '| customer:', inv?.customer?.name);

  // Count solar invoices via search of invoices list
  const list = await fetch(BASE + '/api/invoices?limit=100', { headers: H }).then(r => r.json());
  const solar = (list.invoices || []).filter(x => x.number?.startsWith('SOLAR-52051449'));
  console.log('Solar invoices in latest 100 list:', solar.length);

  // PDF
  const pdf = await fetch(BASE + '/api/pdf/invoices/22cc2e45-d615-4f98-90d4-76098fea2aac', { method: 'POST', headers: H }).then(r => r.json());
  console.log('PDF API:', JSON.stringify(pdf));
  const fs = await import('node:fs');
  const p = pdf.path ? 'D:/meter/backend/' + pdf.path.replace(/\\/g, '/') : null;
  if (p && fs.existsSync(p)) console.log('PDF file exists:', fs.statSync(p).size, 'bytes, magic:', fs.readFileSync(p).subarray(0,5).toString());
};
run().catch(e => console.log('ERR', e.code || e.message));
