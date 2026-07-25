import { test, expect } from '@playwright/test';

test.describe('Admin — Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.evaluate(() => {
      // Access zustand store to set active page
      const store = (window as any).__ZUSTAND_STORE__;
      if (store) store.getState().setActivePage('projects');
    });
  });

  test('should load projects page and display title', async ({ page }) => {
    await expect(page.locator('text=Projects')).toBeVisible({ timeout: 10000 });
  });

  test('should show stats cards for projects', async ({ page }) => {
    await expect(page.locator('.stats-card')).toHaveCount(2, { timeout: 10000 });
  });
});

test.describe('Admin — Meters Page', () => {
  test('should navigate to meters and show table', async ({ page }) => {
    await page.goto('/admin');
    await page.evaluate(() => {
      const store = (window as any).__ZUSTAND_STORE__;
      if (store) store.getState().setActivePage('meters');
    });
    await expect(page.locator('text=Meter Management')).toBeVisible({ timeout: 10000 });
  });
});
