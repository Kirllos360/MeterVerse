"use client"

import { useMemo } from "react"
import { useAppRegistry } from "../registry/application-registry"

export function useNavItems() {
  const apps = useAppRegistry((s) => s.apps)
  const visible = useMemo(() => apps.filter((a) => a.visible !== false), [apps])

  const sidebarItems = useMemo(() =>
    visible.map((a) => ({
      id: a.id,
      label: a.title,
      icon: a.icon,
      route: a.route,
      badge: a.badge,
      category: a.category,
      order: a.order ?? 99,
      isBeta: a.beta,
      isExperimental: a.experimental,
    })).sort((a, b) => a.order - b.order),
  [visible])

  const searchIndex = useMemo(() =>
    visible.map((a) => ({
      id: a.id,
      label: a.title,
      description: a.description,
      keywords: a.tags ?? [],
      route: a.route,
    })),
  [visible])

  const favorites = useMemo(() => visible.filter((a) => a.tags?.includes("favorite")), [visible])

  return { sidebarItems, searchIndex, favorites, totalApps: visible.length }
}
