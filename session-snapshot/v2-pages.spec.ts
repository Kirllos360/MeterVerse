import { test, expect } from "@playwright/test";

test.describe("V2 Design System", () => {
  test("showcase loads with sections", async ({ page }) => {
    await page.goto("/v2/design-system", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: "Design System" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Typography" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Button" })).toBeVisible();
  });

  test("no console errors on showcase", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/v2/design-system", { waitUntil: "load" });
    expect(errors).toEqual([]);
  });
});

test.describe("Three-Panel Layout — Visual Assertions", () => {
  test("page renders three-panel layout (sidebar, explorer, workspace, inspector)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const res = await page.goto("/v2", { waitUntil: "load" });
    expect(res?.status()).toBe(200);

    // Sidebar is visible and has correct width (48px)
    const sidebar = page.locator(".w-12").first();
    await expect(sidebar).toBeVisible();
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox).not.toBeNull();
    if (sidebarBox) {
      expect(sidebarBox.width).toBeGreaterThanOrEqual(44);
      expect(sidebarBox.width).toBeLessThanOrEqual(56);
    }

    // Explorer panel has customers list with real data rows
    await expect(page.getByText("Mohamed Ali").first()).toBeVisible();
    await expect(page.getByText("Sara Khaled").first()).toBeVisible();
    await expect(page.getByText("Mahmoud Ibrahim").first()).toBeVisible();
    await expect(page.getByText("Nadia Youssef").first()).toBeVisible();

    // Workspace shows onboarding dashboard with Quick Actions
    await expect(page.getByText("Quick Actions")).toBeVisible();

    // Inspector panel is visible
    await expect(page.getByRole("heading", { name: "Inspector" })).toBeVisible();

    // No console errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/v2", { waitUntil: "load" });
    expect(errors).toEqual([]);
  });

  test("selecting customer from explorer populates workspace and inspector", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/v2", { waitUntil: "load" });

    // Click on a customer in explorer
    await page.getByText("Ahmed El-Sayed").first().click();

    // Workspace shows customer heading
    await expect(page.getByRole("heading", { name: "Ahmed El-Sayed" })).toBeVisible();

    // CustomerWorkspace shows KPI cards
    await expect(page.getByText("Balance").first()).toBeVisible();
    await expect(page.getByText("Invoices").first()).toBeVisible();

    // Inspector shows properties (code, type, status)
    await expect(page.getByText("Properties")).toBeVisible();

    // CustomerWorkspace sections are present (progressive disclosure)
    await expect(page.getByText("Quick Actions:")).toBeVisible();
    await expect(page.getByText("Financial Health")).toBeVisible();
  });

  test("all 7 V2 routes return 200", async ({ page }) => {
    for (const path of ["/v2", "/v2/customers", "/v2/meters", "/v2/readings", "/v2/invoices", "/v2/payments", "/v2/settings"]) {
      const res = await page.goto(path, { waitUntil: "load" });
      expect(res?.status()).toBe(200);
    }
  });

  test("sidebar navigation toggles entity type", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/v2", { waitUntil: "load" });

    // Initially showing customers
    await expect(page.getByText("customers").first()).toBeVisible();

    // Click Meters icon in sidebar
    await page.getByTitle("Meters").click();
    await expect(page.getByText("meters").first()).toBeVisible();
  });

  test("detail pages load with real content", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/v2/customers/c1", { waitUntil: "load" });

    // Explorer shows customers
    await expect(page.getByText("Ahmed El-Sayed").first()).toBeVisible();

    // Workspace shows customer detail
    await expect(page.getByRole("heading", { name: "Ahmed El-Sayed" })).toBeVisible();

    // No console errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/v2/customers/c1", { waitUntil: "load" });
    expect(errors).toEqual([]);
  });

  test("meter detail loads", async ({ page }) => {
    const res = await page.goto("/v2/meters/m1", { waitUntil: "load" });
    expect(res?.status()).toBe(200);
  });
});
