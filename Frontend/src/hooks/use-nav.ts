"use client"

import { useMemo } from "react"
import { useAuth } from "@/providers/auth-context"
import type { NavItem, NavGroup } from "@/types"

export function useFilteredNavItems(items: NavItem[]) {
  const { user } = useAuth()

  const accessContext = useMemo(() => {
    return {
      user,
      isAuthenticated: true,
    }
  }, [user])

  return useMemo(() => {
    return filterItems(items, accessContext)
  }, [items, accessContext])
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const { user } = useAuth()

  return useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: filterItems(group.items, { user, isAuthenticated: true }),
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
