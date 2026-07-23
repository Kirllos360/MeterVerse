const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ 
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    console.log('Navigating...');
    await page.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'chrome-channel-test.png', fullPage: true });
    console.log('SUCCESS');
    await browser.close();
  } catch(e) {
    console.error('FAILED:', e.message);
    // Try without channel
    try {
      console.log('Retrying without channel...');
      const browser2 = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
      const page2 = await browser2.newPage();
      const resp = await page2.goto('http://localhost:7400/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log('Response status: ' + resp.status());
      await page2.waitForTimeout(3000);
      await page2.screenshot({ path: 'no-channel-test.png', fullPage: true });
      console.log('SUCCESS on retry');
      await browser2.close();
    } catch(e2) {
      console.error('ALSO FAILED:', e2.message);
    }
  }
})();
