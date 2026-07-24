import { describe, it, expect } from "vitest"

describe("Frontend Integration Tests", () => {
  it("should have valid feature flags module", async () => {
    const { isModuleEnabled, useMockApi } = await import("../src/lib/feature-flags")
    expect(isModuleEnabled("customers")).toBe(true)
    expect(isModuleEnabled("meters")).toBe(true)
    expect(useMockApi("customers")).toBe(false)
  })

  it("should have valid api client module", async () => {
    const mod = await import("../src/lib/api-client")
    expect(mod).toBeDefined()
  })

  it("should have valid query client module", async () => {
    const mod = await import("../src/lib/query-client")
    expect(mod).toBeDefined()
  })

  it("should have valid page configs", async () => {
    const mod = await import("../src/admin/tables/page-configs")
    expect(mod.pageConfigs).toBeDefined()
    expect(Object.keys(mod.pageConfigs).length).toBeGreaterThan(10)
  })
})
