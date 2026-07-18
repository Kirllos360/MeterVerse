import { create } from "zustand"

export type NavItemType = "category" | "group" | "app" | "link" | "module" | "divider"

export interface NavItem {
  id: string
  title: string
  titleAr?: string
  icon?: string
  type: NavItemType
  route?: string
  parentId?: string
  children?: NavItem[]
  badge?: string | number
  badgeVariant?: "count" | "alert" | "warning" | "success" | "draft"
  permissions?: string[]
  featureFlag?: string
  workspace?: string
  entity?: string
  searchTerms?: string[]
  order?: number
  hidden?: boolean
  pinned?: boolean
}

interface NavState {
  items: NavItem[]
  flatMap: Map<string, NavItem>
  register: (item: NavItem) => void
  registerMany: (items: NavItem[]) => void
  unregister: (id: string) => void
  get: (id: string) => NavItem | undefined
  getTree: () => NavItem[]
  getFlattened: () => NavItem[]
  search: (query: string) => NavItem[]
  clear: () => void
}

function flatten(items: NavItem[]): NavItem[] {
  const result: NavItem[] = []
  for (const item of items) {
    result.push(item)
    if (item.children) result.push(...flatten(item.children))
  }
  return result
}

function filterByPermission(items: NavItem[], hasPermission: (perm: string) => boolean): NavItem[] {
  return items
    .filter((item) => {
      if (item.permissions && item.permissions.length > 0) return item.permissions.some((p) => hasPermission(p))
      return true
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterByPermission(item.children, hasPermission) : undefined,
    }))
    .filter((item) => !item.hidden)
}

export const useNavigationRegistry = create<NavState>((set, get) => ({
  items: [],
  flatMap: new Map(),

  register: (item) => set((s) => {
    const existing = s.items.filter((i) => i.id !== item.id)
    const newItems = [...existing, item]
    const flat = new Map(flatten(newItems).map((i) => [i.id, i]))
    return { items: newItems, flatMap: flat }
  }),

  registerMany: (items) => {
    items.forEach((item) => get().register(item))
  },

  unregister: (id) => set((s) => {
    const newItems = s.items.filter((i) => i.id !== id && i.parentId !== id)
    const flat = new Map(flatten(newItems).map((i) => [i.id, i]))
    return { items: newItems, flatMap: flat }
  }),

  get: (id) => get().flatMap.get(id),
  getTree: () => get().items,
  getFlattened: () => flatten(get().items),

  search: (query) => {
    const q = query.toLowerCase()
    return flatten(get().items).filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleAr?.includes(q) ||
        item.searchTerms?.some((t) => t.toLowerCase().includes(q))
    )
  },

  clear: () => set({ items: [], flatMap: new Map() }),
}))

// Filtered view factory
export function useFilteredNav(hasPermission: (perm: string) => boolean) {
  const items = useNavigationRegistry((s) => s.items)
  return filterByPermission(items, hasPermission)
}
