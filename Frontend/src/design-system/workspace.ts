export const workspace = {
  panels: {
    sidebar: { defaultWidth: 256, minWidth: 48, maxWidth: 480 },
    inspector: { defaultWidth: 360, minWidth: 280, maxWidth: 512 },
    explorer: { defaultWidth: 320, minWidth: 240, maxWidth: 480 },
  },
  topbar: {
    height: 48,
    minHeight: 40,
    maxHeight: 56,
  },
  statusbar: {
    height: 32,
  },
  breakpoints: {
    "2xl": 1536,
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 640,
  },
  layout: {
    contentMaxWidth: 1440,
    contentPadding: "24px 32px",
  },
  header: {
    titleSize: 18,
    descriptionSize: 13,
    actionGap: 8,
  },
} as const

export type MeterVerseWorkspace = typeof workspace
