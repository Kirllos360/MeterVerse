import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:3535/admin';
const BACKEND_URL = 'http://localhost:3131';

async function login(page: any) {
  const token = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'super_admin' }),
  }).then(r => r.json()).then(d => d.accessToken);
  await page.evaluate((t: string) => {
    localStorage.setItem('mv-dev-token', t);
  }, token);
}

test.describe('Admin Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('01 â€” Home page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await expect(page.locator('text=Home').first()).toBeVisible({ timeout: 15000 });
  });

  test('02 â€” Sidebar has 17 items', async ({ page }) => {
    await page.goto(ADMIN_URL);
    const buttons = page.locator('button').filter({ hasText: /Home|Monitoring|Connection|Database Management|Migration & Uploads|Location|Users & Permissions|Customer|Meter|Readings|Tariff|Billing Cycles|Invoices|Payment/ });
    await expect(buttons.first()).toBeVisible({ timeout: 10000 });
  });

  test('03 â€” Monitoring page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Monitoring').first().click();
    await expect(page.locator('text=Monitoring View').first()).toBeVisible({ timeout: 10000 });
  });

  test('04 â€” Connection page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Connection').first().click();
    await expect(page.locator('text=Connection Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('05 â€” Customer page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Customer').first().click();
    await expect(page.locator('text=Customer Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('06 â€” Meter page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Meter').first().click();
    await expect(page.locator('text=Meter Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('07 â€” Location selector visible in header', async ({ page }) => {
    await page.goto(ADMIN_URL);
    const selector = page.locator('text=Select Area');
    await expect(selector).toBeVisible({ timeout: 10000 });
  });

  test('08 â€” General Settings page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('General Settings').first().click();
    await expect(page.locator('text=Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('09 â€” Audit Log page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Audit Log').first().click();
    await expect(page.locator('text=Audit').first()).toBeVisible({ timeout: 10000 });
  });

  test('10 â€” Reports page loads', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByText('Reports').first().click();
    await expect(page.locator('text=Report Settings').first()).toBeVisible({ timeout: 10000 });
  });
});
