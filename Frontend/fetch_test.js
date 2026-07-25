const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx.addInitScript(function() {
    var d = JSON.stringify({
      state: { user: { id: 'dev', name: 'Admin', role: 'super_admin' }, tokens: { accessToken: 'dev' } }
    });
    localStorage.setItem('mv-identity', d);
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:7400/', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Test fetch from browser
  var result = await page.evaluate(function() {
    return fetch('/api/health', { headers: { 'X-Dev-Mode': 'true' } })
      .then(function(r) { return r.status + ' ' + r.statusText; })
      .catch(function(e) { return 'ERR: ' + e.message; });
  });
  console.log('Fetch /api/health:', result);

  var result2 = await page.evaluate(function() {
    return fetch('/api/customers', { headers: { 'X-Dev-Mode': 'true' } })
      .then(function(r) { return r.status + ' ' + r.statusText; })
      .catch(function(e) { return 'ERR: ' + e.message; });
  });
  console.log('Fetch /api/customers:', result2);

  await browser.close();
  console.log('DONE');
})();
