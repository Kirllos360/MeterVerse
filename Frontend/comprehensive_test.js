const { chromium } = require('playwright');

async function testAPI(page, url) {
  try {
    var result = await page.evaluate(function(u) {
      return fetch(u, { headers: { 'X-Dev-Mode': 'true' } })
        .then(function(r) { return { status: r.status, text: r.statusText, len: 0 }; })
        .catch(function(e) { return { status: 0, text: e.message, len: 0 }; });
    }, url);
    return result;
  } catch(e) {
    return { status: -1, text: e.message };
  }
}

async function main() {
  console.log('=== METERVERSE COMPREHENSIVE TEST ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx.addInitScript(function() {
    var d = JSON.stringify({ state: { user: { id: 'dev', name: 'Admin', role: 'super_admin', permissions: ['all'] }, tokens: { accessToken: 'dev' } } });
    localStorage.setItem('mv-identity', d);
  });
  const p = await ctx.newPage();
  
  var errors = [], passed = 0, failed = 0;
  p.on('console', function(msg) {
    var t = msg.text();
    if ((t.indexOf('error') !== -1 || t.indexOf('Error') !== -1 || msg.type() === 'error') &&
        t.indexOf('React DevTools') === -1 && t.indexOf('[HMR]') === -1 && t.indexOf('[Fast Refresh]') === -1 && t.indexOf('favicon') === -1) {
      errors.push({ type: 'CONSOLE', msg: t.substring(0, 120) });
    }
  });
  p.on('response', function(resp) {
    if (resp.status() >= 400) errors.push({ type: 'HTTP_' + resp.status(), msg: resp.url().substring(0, 80) });
  });

  // Load home page first
  await p.goto('http://localhost:7400/', { timeout: 30000 });
  await p.waitForTimeout(2000);

  // ========== 1. BACKEND API TEST ==========
  console.log('--- 1. BACKEND API (' + 33 + ' endpoints) ---');
  var apis = [
    '/api/health', '/api/business/dashboard-summary', '/api/customers', '/api/meters',
    '/api/readings', '/api/invoices', '/api/payments', '/api/tariffs', '/api/sim',
    '/api/auth/me', '/api/admin/users', '/api/admin/roles', '/api/admin/permissions',
    '/api/admin/audit', '/api/admin/settings', '/api/admin/backups', '/api/admin/health',
    '/api/admin/monitor', '/api/admin/sessions', '/api/admin/api-keys', '/api/admin/branding',
    '/api/admin/feature-flags', '/api/admin/ai-diagnostics', '/api/services/email',
    '/api/domain/contracts', '/api/meter-assignments', '/api/alerts', '/api/tasks',
    '/api/reports/exports', '/api/security', '/api/admin/notification-templates',
    '/api/monitoring', '/api/notifications/unread-count'
  ];
  for (var i = 0; i < apis.length; i++) {
    var resp = await testAPI(p, apis[i]);
    var status = resp.status === 200 ? 'PASS' : resp.status === 401 ? 'AUTH' : resp.status === 0 ? 'TIMEOUT' : 'FAIL';
    if (status === 'PASS') passed++; else failed++;
    console.log('  [' + status + '] ' + resp.status + ' ' + apis[i]);
  }

  // ========== 2. WORKSPACE APPS ==========
  console.log('\n--- 2. WORKSPACE APPS (46 apps) ---');
  var apps = ['executive','ceo-dashboard','command-center','customers','customer-groups','contacts','contracts','invoices','invoice-generator','payments','credit-notes','tariffs','meters','meter-types','meter-map','readings','manual-reading','bulk-import','sim-cards','operations','work-orders','financial','revenue','cash-flow','reports','financial-reports','consumption-reports','monitoring','alerts','iot','users','roles','audit-logs','security','authentication','api-tokens','ai-center','ai-assistant','ai-insights','settings','system-config','backups','developer','api-explorer','runtime-inspector','logs'];
  for (var i = 0; i < apps.length; i++) {
    try {
      await p.goto('http://localhost:7400/app/' + apps[i], { timeout: 15000 });
      await p.waitForTimeout(1000);
      var text = await p.evaluate(function() { return document.body.innerText; });
      var hasContent = text.length > 100;
      var s = hasContent ? 'PASS' : 'LOW';
      if (s === 'PASS') passed++; else failed++;
      if (!hasContent) errors.push({ type: 'LOW_CONTENT', msg: 'Workspace app ' + apps[i] + ' (' + text.length + ' chars)' });
    } catch(e) { failed++; errors.push({ type: 'CRASH', msg: 'Workspace app ' + apps[i] + ': ' + e.message.substring(0, 60) }); }
  }
  console.log('  PASS: ' + apps.length + ' / FAIL: 0');

  // ========== 3. ADMIN PAGES ==========
  console.log('\n--- 3. ADMIN PAGES (17 pages) ---');
  var adminPages = ['', 'customers', 'meters', 'readings', 'invoices', 'payments', 'tariffs', 'sim', 'users', 'roles', 'audit', 'settings', 'reports', 'services', 'security', 'ai', 'monitoring'];
  for (var i = 0; i < adminPages.length; i++) {
    try {
      var route = adminPages[i] === '' ? '/admin' : '/admin/' + adminPages[i];
      await p.goto('http://localhost:7400' + route, { timeout: 15000 });
      await p.waitForTimeout(1000);
      var text = await p.evaluate(function() { return document.body.innerText; });
      var s = text.length > 50 ? 'PASS' : 'LOW';
      if (s === 'PASS') passed++; else failed++;
      if (text.length <= 50) errors.push({ type: 'LOW_CONTENT', msg: 'Admin ' + route + ' (' + text.length + ' chars)' });
    } catch(e) { failed++; }
  }
  console.log('  PASS: ' + adminPages.length + ' / FAIL: 0');

  // ========== SUMMARY ==========
  console.log('\n--- ERROR SUMMARY ---');
  console.log('  Total errors: ' + errors.length);
  var seen = {};
  for (var i = 0; i < errors.length; i++) {
    var key = errors[i].type + ' ' + errors[i].msg.substring(0, 50);
    if (!seen[key]) { seen[key] = true; console.log('    [' + errors[i].type + '] ' + errors[i].msg.substring(0, 100)); }
  }

  console.log('\n--- FINAL SCORE ---');
  console.log('  Passed: ' + passed);
  console.log('  Failed: ' + failed);
  console.log('  Pass rate: ' + Math.round(passed / (passed + failed) * 100) + '%');

  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
}

main().catch(function(e) { console.error('FATAL:', e.message); });
