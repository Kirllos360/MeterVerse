const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    console.log('Navigating to http://localhost:7400/admin...');
    await page.goto('http://localhost:7400/admin', { waitUntil: 'load', timeout: 60000 });
    console.log('Page loaded, waiting 3s...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-capture-2.png', fullPage: true });
    console.log('SUCCESS: Screenshot captured to test-capture-2.png');
    await browser.close();
  } catch(e) {
    console.error('FAILED:', e.message);
  }
})();
