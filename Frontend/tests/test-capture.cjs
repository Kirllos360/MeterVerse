const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-capture.png', fullPage: true });
    console.log('SUCCESS: Screenshot captured');
    await browser.close();
  } catch(e) {
    console.error('FAILED:', e.message);
  }
})();
