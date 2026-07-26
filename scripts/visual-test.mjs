import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:7400';
const SS_DIR = join(__dirname, '..', 'docs', 'screenshots', 'visual-audit');

mkdirSync(SS_DIR, { recursive: true });

const PAGES = [
  { path: '/', name: 'root' },
  { path: '/admin', name: 'admin' },
  { path: '/admin/customers', name: 'admin-customers' },
  { path: '/admin/meters', name: 'admin-meters' },
  { path: '/admin/invoices', name: 'admin-invoices' },
  { path: '/admin/payments', name: 'admin-payments' },
  { path: '/admin/monitoring', name: 'admin-monitoring' },
  { path: '/admin/users', name: 'admin-users' },
  { path: '/admin/roles', name: 'admin-roles' },
  { path: '/admin/audit', name: 'admin-audit' },
  { path: '/admin/projects', name: 'admin-projects' },
  { path: '/admin/zones', name: 'admin-zones' },
  { path: '/admin/units', name: 'admin-units' },
  { path: '/admin/reports', name: 'admin-reports' },
  { path: '/admin/settings', name: 'admin-settings' },
  { path: '/admin/sim', name: 'admin-sim' },
  { path: '/admin/readings', name: 'admin-readings' },
  { path: '/admin/tariffs', name: 'admin-tariffs' },
  { path: '/admin/rca-workspace', name: 'admin-rca-workspace' },
  { path: '/admin/accounting', name: 'admin-accounting' },
  { path: '/admin/sync', name: 'admin-sync' },
  { path: '/admin/upload', name: 'admin-upload' },
  { path: '/admin/collections', name: 'admin-collections' },
  { path: '/admin/workflows', name: 'admin-workflows' },
  { path: '/admin/alerts', name: 'admin-alerts' },
  { path: '/admin/documents', name: 'admin-documents' },
  { path: '/admin/accounting/accounts', name: 'admin-accounting-accounts' },
  { path: '/admin/accounting/journal', name: 'admin-accounting-journal' },
  { path: '/admin/accounting/ledger', name: 'admin-accounting-ledger' },
  { path: '/admin/accounting/trial-balance', name: 'admin-accounting-trial-balance' },
];

const results = [];

async function testPage(page, { path, name }) {
  const url = `${BASE}${path}`;
  const entry = { path, name, status: null, title: null, hasContent: false, errors: [], timeout: false };
  const consoleErrs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrs.push(msg.text());
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    entry.status = resp?.status() ?? null;

    await page.waitForTimeout(1000);

    entry.title = await page.title();
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim?.() ?? '');
    entry.hasContent = bodyText.length > 50 && !bodyText.includes('Cannot GET') && !bodyText.includes('404');

    if (consoleErrs.length) {
      entry.errors = consoleErrs;
    }

    const ssPath = join(SS_DIR, `${name}.png`);
    await page.screenshot({ path: ssPath, fullPage: true });
  } catch (err) {
    if (err.message?.includes('Timeout')) {
      entry.timeout = true;
      // take a screenshot anyway
      try {
        const ssPath = join(SS_DIR, `${name}.png`);
        await page.screenshot({ path: ssPath, fullPage: true });
        entry.title = await page.title();
      } catch (_) { /* ignore */ }
    }
    entry.errors.push(err.message);
  }

  results.push(entry);
  return entry;
}

async function main() {
  console.log('🚀 Launching Playwright headless browser...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  for (const p of PAGES) {
    process.stdout.write(`  Testing ${p.path} ... `);
    const entry = await testPage(page, p);
    const ok = entry.status === 200 && entry.hasContent;
    const symbol = ok ? '✅' : '❌';
    const reason = !ok ? ` (status=${entry.status}, content=${entry.hasContent}${entry.timeout ? ', TIMEOUT' : ''}${entry.errors.length ? ', errors=' + entry.errors.length : ''})` : '';
    console.log(`${symbol}${reason}`);
  }

  await browser.close();

  // Generate summary
  const pass = results.filter(r => r.status === 200 && r.hasContent).length;
  const fail = results.filter(r => !(r.status === 200 && r.hasContent)).length;
  const total = results.length;

  const rows = results.map(r => {
    const ok = r.status === 200 && r.hasContent;
    const statusStr = r.status ? `${r.status}` : 'ERR';
    const icon = ok ? '✅' : '❌';
    const note = r.timeout ? ' (timeout)' : r.errors.length ? ` (${r.errors.length} console error(s))` : '';
    return `| ${icon} | \`${r.path}\` | ${statusStr} | ${r.title?.replace(/\|/g, '\\|') ?? '—'} | ${r.hasContent} |${note} |`;
  }).join('\n');

  const errPages = results.filter(r => r.errors.length > 0);
  const errDetail = errPages.length
    ? errPages.map(r => `### \`${r.path}\`\n\`\`\`\n${r.errors.join('\n')}\n\`\`\``).join('\n\n')
    : 'None';

  const summary = `# Visual Audit Summary

**Date:** ${new Date().toISOString()}
**Base URL:** ${BASE}
**Total Pages:** ${total}
**Passed:** ${pass}
**Failed:** ${fail}
**Pass Rate:** ${(pass / total * 100).toFixed(1)}%

## Results

| Status | Path | HTTP | Title | Has Content | Notes |
|--------|------|------|-------|-------------|-------|
${rows}

## Console Errors

${errDetail}

## Screenshots

All screenshots saved to \`docs/screenshots/visual-audit/\`.
`;

  writeFileSync(join(SS_DIR, 'SUMMARY.md'), summary, 'utf-8');
  console.log(`\n📄 Summary written to docs/screenshots/visual-audit/SUMMARY.md`);
  console.log(`📸 ${results.length} screenshots saved.\n`);
  console.log(`═══ RESULTS ═══`);
  console.log(`  ✅ Pass: ${pass}`);
  console.log(`  ❌ Fail: ${fail}`);
  console.log(`  📊 Rate: ${(pass / total * 100).toFixed(1)}%`);
  results.forEach(r => {
    const ok = r.status === 200 && r.hasContent;
    console.log(`  ${ok ? '✅' : '❌'} ${r.path} (HTTP ${r.status ?? 'ERR'})${r.timeout ? ' ⏰ TIMEOUT' : ''}${r.errors.length ? ` ⚠️ ${r.errors.length} error(s)` : ''}`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
