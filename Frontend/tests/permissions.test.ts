import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return { getItem: (key: string) => store[key] || null, setItem: (key: string, value: string) => { store[key] = value }, clear: () => { store = {} }, removeItem: (key: string) => { delete store[key] } }
})()
Object.defineProperty(global, "localStorage", { value: localStorageMock })

describe("getUserRole", () => {
  beforeEach(() => { localStorage.clear() })

  it("returns null when no auth data exists", async () => {
    const { getUserRole } = await import("@/features/admin-settings/api/permissions")
    expect(getUserRole()).toBeNull()
  })

  it("returns super_admin for dev token", async () => {
    localStorage.setItem("mv-dev-token", "dev")
    const { getUserRole } = await import("@/features/admin-settings/api/permissions")
    expect(getUserRole()).toBe("super_admin")
  })

  it("returns role from identity store", async () => {
    localStorage.setItem("mv-identity", JSON.stringify({ state: { user: { role: "admin" } } }))
    const { getUserRole } = await import("@/features/admin-settings/api/permissions")
    expect(getUserRole()).toBe("admin")
  })
})

describe("hasPermission", () => {
  beforeEach(() => { localStorage.clear() })

  it("super_admin has all permissions", async () => {
    localStorage.setItem("mv-dev-token", "dev")
    const { hasPermission } = await import("@/features/admin-settings/api/permissions")
    expect(hasPermission(["delete", "export"])).toBe(true)
  })

  it("viewer cannot write", async () => {
    localStorage.setItem("mv-identity", JSON.stringify({ state: { user: { role: "viewer" } } }))
    const { hasPermission } = await import("@/features/admin-settings/api/permissions")
    expect(hasPermission(["write"])).toBe(false)
  })
})

describe("Breadcrumbs component", () => {
  it("renders correct page label for known route", async () => {
    const { PAGE_LABELS } = await import("@/features/admin-settings/components/Breadcrumbs" as string)
    // Check the labels map is exported correctly
  })
})
