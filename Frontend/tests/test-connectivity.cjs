const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    console.log('Navigating to http://localhost:7400/admin...');
    await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('? Page loaded!');
    await page.screenshot({ path: 'connectivity-test.png', fullPage: true });
    console.log('? Screenshot captured');
    await browser.close();
  } catch(e) {
    console.error('? FAILED:', e.message);
  }
})();
