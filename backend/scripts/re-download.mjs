const fs = await import('node:fs');
const run = async () => {
  const lr = await fetch('http://localhost:3131/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meterverse.com', password: 'Admin@123' }),
  });
  const tok = (await lr.json()).accessToken;
  const r = await fetch('http://localhost:3131/api/pdf/invoices/22cc2e45-d615-4f98-90d4-76098fea2aac/download', {
    headers: { authorization: 'Bearer ' + tok },
  });
  console.log('status', r.status, '| ct', r.headers.get('content-type'), '| cd', r.headers.get('content-disposition'));
  const b = Buffer.from(await r.arrayBuffer());
  console.log('bytes', b.length, '| magic', b.subarray(0, 5).toString());
  fs.writeFileSync('C:/Users/EPower/AppData/Local/Temp/opencode/downloads/SOLAR-52051449-2021-01.pdf', b);
};
run();
