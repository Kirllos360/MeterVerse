import { useNavigationRegistry, type NavItem } from "../registry/NavigationRegistry"
import { useFavoritesRuntime } from "../favorites/FavoritesRuntime"
import { useRecentRuntime } from "../recent/RecentRuntime"
import { useBadgeRuntime } from "../badges/BadgeRuntime"
import { useNavSearchRuntime, type SearchResult } from "../search/NavSearchRuntime"
import { useCommandRuntime } from "@/runtime/command/command-runtime"

export const NavSDK = {
  // Register navigation items hierarchically
  registerNav: (items: NavItem[]) => {
    useNavigationRegistry.getState().registerMany(items)
    items.forEach((item) => {
      if (item.badge !== undefined) {
        const count = typeof item.badge === "number" ? item.badge : 0
        useBadgeRuntime.getState().setBadge(item.id, count)
      }
    })
    return NavSDK
  },

  // Register a single nav item
  registerNavItem: (item: NavItem) => {
    useNavigationRegistry.getState().register(item)
    return NavSDK
  },

  // Register searchable navigation
  registerSearchResults: (results: SearchResult[]) => {
    useNavSearchRuntime.getState().setResults(results)
    return NavSDK
  },

  // Register command palette commands from navigation
  registerNavCommands: () => {
    const items = useNavigationRegistry.getState().getFlattened()
    items.forEach((item) => {
      if (item.route && item.type === "app") {
        useCommandRuntime.getState().registerAction({
          id: `nav-${item.id}`,
          label: item.title,
          labelAr: item.titleAr,
          category: "navigation",
          action: () => {
            if (typeof window !== "undefined") window.location.href = item.route!
          },
        })
      }
    })
    return NavSDK
  },

  // Register an entire business module's navigation
  registerModule: (config: {
    navigation: NavItem[]
    category?: string
    permissions?: string[]
  }) => {
    NavSDK.registerNav(config.navigation)
    return NavSDK
  },

  // Get filtered navigation for a role
  getFilteredNav: (permissions: string[]) => {
    const all = useNavigationRegistry.getState().getTree()
    return filterByPermission(all, permissions)
  },
}

function filterByPermission(items: NavItem[], permissions: string[]): NavItem[] {
  return items
    .filter((item) => {
      if (item.permissions && item.permissions.length > 0)
        return item.permissions.some((p) => permissions.includes(p))
      return true
    })
    .filter((i) => !i.hidden)
    .map((item) => ({
      ...item,
      children: item.children ? filterByPermission(item.children, permissions) : undefined,
    }))
}
