const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    console.log('Navigating to http://localhost:7400/admin...');
    await page.goto('http://localhost:7400/admin', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('Page loaded!');
    await page.screenshot({ path: 'puppet-test.png', fullPage: true });
    console.log('Screenshot saved to puppet-test.png');
    await browser.close();
  } catch(e) {
    console.error('FAILED:', e.message);
  }
})();
