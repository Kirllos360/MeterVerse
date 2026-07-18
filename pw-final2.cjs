const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  await page.evaluate(() => { localStorage.setItem('auth-storage', JSON.stringify({ state: { user: { id: 'USR-001', name: 'Ahmed', role: 'super_admin', isAuthenticated: true }, version: 0 })); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);
  const btn = await page.evaluate(() => document.querySelectorAll('button').length);
  console.log('Buttons found:', btn);
  await browser.close();
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });