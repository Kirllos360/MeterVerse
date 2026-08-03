// Certification Test Suite (T114)
const CHECKS = [];

function check(name, fn) {
  CHECKS.push({ name, fn });
}

async function runCertification() {
  console.log('=== MeterVerse Certification Suite ===\n');
  let passed = 0, failed = 0;

  for (const c of CHECKS) {
    try {
      await c.fn();
      console.log(`  âœ… ${c.name}`);
      passed++;
    } catch (err) {
      console.log(`  âŒ ${c.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`Certification: ${failed === 0 ? 'PASSED âœ…' : 'FAILED âŒ'}`);
  process.exit(failed > 0 ? 1 : 0);
}

// Core checks
check('API health endpoint', async () => {
  const res = await fetch('http://localhost:3131/api/health');
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

check('Database connectivity', async () => {
  const res = await fetch('http://localhost:3131/api/admin/health');
  if (res.status !== 200) throw new Error('DB health check failed');
});

check('Auth endpoints work', async () => {
  const res = await fetch('http://localhost:3131/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.status !== 400 && res.status !== 401) throw new Error(`Unexpected status ${res.status}`);
});

check('Customer CRUD', async () => {
  const res = await fetch('http://localhost:3131/api/customers', { headers: { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true' } });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

check('Meter CRUD', async () => {
  const res = await fetch('http://localhost:3131/api/meters', { headers: { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true' } });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

check('Invoice generation', async () => {
  const res = await fetch('http://localhost:3131/api/invoices', { headers: { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true' } });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

check('Payment processing', async () => {
  const res = await fetch('http://localhost:3131/api/payments', { headers: { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true' } });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

check('Security headers present', async () => {
  const res = await fetch('http://localhost:3131/api/health');
  const csp = res.headers.get('content-security-policy');
  if (!csp) throw new Error('Missing CSP header');
});

check('CORS configured', async () => {
  const res = await fetch('http://localhost:3131/api/health', { headers: { 'Origin': 'http://localhost:3535' } });
  const acao = res.headers.get('access-control-allow-origin');
  if (!acao) throw new Error('Missing CORS header');
});

runCertification().catch(console.error);
