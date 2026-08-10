"use client"

import { useMemo } from "react"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"
import type { NavItem, NavGroup } from "@/types"

export function useFilteredNavItems(items: NavItem[]) {
  const user = useAuthRuntime((s) => s.user)

  const accessContext = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
    }
  }, [user])

  return useMemo(() => {
    return filterItems(items, accessContext)
  }, [items, accessContext])
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const user = useAuthRuntime((s) => s.user)

  return useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: filterItems(group.items, { user, isAuthenticated: !!user }),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, user])
}

interface AccessContext {
  user: { id: string; email: string; name: string; role: string } | null
  isAuthenticated: boolean
}

function filterItems(items: NavItem[], context: AccessContext): NavItem[] {
  return items
    .filter((item) => {
      if (!context.isAuthenticated) return false
      if (item.access?.requireOrg) return true
      return true
    })
    .map((item) => ({
      ...item,
      items: item.items ? filterItems(item.items, context) : [],
    }))
}
