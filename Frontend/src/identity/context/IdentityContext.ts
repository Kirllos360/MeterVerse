import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "../auth/AuthRuntime"
import type { Role } from "../permission/PermissionRuntime"

interface IdentityState {
  user: AuthUser | null
  role: Role
  area: string
  project: string
  tenant: string
  language: string
  theme: string
  permissions: string[]
  features: string[]
  workspace: string

  setUser: (user: AuthUser) => void
  setRole: (role: Role) => void
  setArea: (area: string) => void
  setProject: (project: string) => void
  setTenant: (tenant: string) => void
  setLanguage: (language: string) => void
  setTheme: (theme: string) => void
  setPermissions: (permissions: string[]) => void
  setFeatures: (features: string[]) => void
  hasFeature: (feature: string) => boolean
}

export const useIdentityContext = create<IdentityState>()(
  persist(
    (set, get) => ({
      user: null,
      role: "admin",
      area: "October",
      project: "Phase 1",
      tenant: "Palm Hills",
      language: "en",
      theme: "adaptive",
      permissions: [],
      features: ["reports", "analytics", "export", "ai-insights", "bulk-operations"],
      workspace: "default",

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setArea: (area) => set({ area }),
      setProject: (project) => set({ project }),
      setTenant: (tenant) => set({ tenant }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setPermissions: (permissions) => set({ permissions }),
      setFeatures: (features) => set({ features }),
      hasFeature: (feature) => get().features.includes(feature),
    }),
    { name: "mv-identity", partialize: (s) => ({ language: s.language, theme: s.theme, area: s.area, project: s.project, tenant: s.tenant }) }
  )
)
