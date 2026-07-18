export const sidebar = {
  width: {
    expanded: 256,
    collapsed: 64,
    dock: 48,
    floating: 256,
    min: 48,
    max: 480,
  },
  item: {
    height: 40,
    padding: "10px 16px",
    gap: 10,
    iconSize: 20,
    fontSize: 13,
    borderRadius: 8,
  },
  group: {
    gap: 6,
    padding: "4px 8px",
  },
  section: {
    height: 56,
    logoSize: 32,
    padding: "0 16px",
  },
  search: {
    height: 36,
    borderRadius: 8,
  },
  badge: {
    size: 18,
    fontSize: 10,
    dotSize: 6,
  },
  avatar: {
    size: 32,
    fontSize: 11,
  },
  footer: {
    height: 48,
    padding: "8px 12px",
  },
  modes: ["expanded", "collapsed", "dock", "floating"] as const,
  dock: {
    width: 52,
    itemSize: 40,
    borderRadius: 20,
    iconSize: 20,
    activeIndicatorWidth: 4,
    activeIndicatorHeight: 24,
  },
} as const

export type MeterVerseSidebar = typeof sidebar
