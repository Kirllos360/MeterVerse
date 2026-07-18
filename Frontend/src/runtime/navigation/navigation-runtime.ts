import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface NavItem {
  id: string
  label: string
  labelAr?: string
  icon?: string
  route?: string
  parentId?: string
  children?: NavItem[]
  permissions?: string[]
  order?: number
  badge?: string | number
  pinned?: boolean
}

interface NavigationState {
  items: NavItem[]
  activeItemId: string | null
  expandedGroups: string[]
  breadcrumbs: { label: string; route?: string }[]
  favorites: string[]
  recent: string[]
  registerItem: (item: NavItem) => void
  registerItems: (items: NavItem[]) => void
  unregisterItem: (id: string) => void
  setActiveItem: (id: string) => void
  toggleGroup: (id: string) => void
  navigate: (route: string) => void
  addRecent: (id: string) => void
  toggleFavorite: (id: string) => void
  setBreadcrumbs: (breadcrumbs: { label: string; route?: string }[]) => void
  getFlattenedItems: () => NavItem[]
  getBreadcrumbsForRoute: (route: string) => NavItem[]
}

export const useNavigationRuntime = create<NavigationState>()(
  persist(
    (set, get) => ({
      items: [],
      activeItemId: null,
      expandedGroups: [],
      breadcrumbs: [],
      favorites: [],
      recent: [],

      registerItem: (item) =>
        set((s) => ({
          items: [...s.items.filter((i) => i.id !== item.id), item],
        })),

      registerItems: (items) =>
        set((s) => {
          const existing = s.items.filter((i) => !items.find((ni) => ni.id === i.id))
          return { items: [...existing, ...items] }
        }),

      unregisterItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),

      setActiveItem: (id) => set({ activeItemId: id }),
      toggleGroup: (id) =>
        set((s) => ({
          expandedGroups: s.expandedGroups.includes(id)
            ? s.expandedGroups.filter((g) => g !== id)
            : [...s.expandedGroups, id],
        })),

      navigate: (route) => {
        const item = get().items.find((i) => i.route === route)
        if (item) {
          set({ activeItemId: item.id })
          get().addRecent(item.id)
        }
      },

      addRecent: (id) =>
        set((s) => ({
          recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 10),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

      getFlattenedItems: () => {
        const flatten = (items: NavItem[]): NavItem[] =>
          items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])])
        return flatten(get().items)
      },

      getBreadcrumbsForRoute: (route) => {
        const findPath = (items: NavItem[], target: string, path: NavItem[] = []): NavItem[] | null => {
          for (const item of items) {
            if (item.route === route) return [...path, item]
            if (item.children) {
              const result = findPath(item.children, route, [...path, item])
              if (result) return result
            }
          }
          return null
        }
        return findPath(get().items, route) || []
      },
    }),
    { name: "meterverse-navigation-runtime" }
  )
)
