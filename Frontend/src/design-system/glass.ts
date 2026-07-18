export const glass = {
  blur: "16px",
  saturation: 1.8,
  opacity: {
    light: 0.6,
    dark: 0.8,
    gray: 0.6,
    night: 0.85,
  },
  bg: {
    light: "rgba(255,255,255,0.6)",
    dark: "rgba(23,23,23,0.8)",
    gray: "rgba(255,255,255,0.6)",
    night: "rgba(13,13,13,0.85)",
  },
  border: {
    light: "rgba(255,255,255,0.18)",
    dark: "rgba(255,255,255,0.08)",
    gray: "rgba(255,255,255,0.15)",
    night: "rgba(255,255,255,0.06)",
  },
  sidebar: {
    bg: {
      light: "rgba(6,78,59,0.85)",
      dark: "rgba(2,26,20,0.92)",
      gray: "rgba(26,26,26,0.85)",
      night: "rgba(0,0,0,0.95)",
    },
    border: {
      light: "rgba(255,255,255,0.12)",
      dark: "rgba(255,255,255,0.06)",
      gray: "rgba(255,255,255,0.08)",
      night: "rgba(255,255,255,0.04)",
    },
  },
  floating: {
    bg: {
      light: "rgba(255,255,255,0.85)",
      dark: "rgba(23,23,23,0.85)",
      gray: "rgba(255,255,255,0.85)",
      night: "rgba(13,13,13,0.9)",
    },
    border: {
      light: "rgba(0,0,0,0.06)",
      dark: "rgba(255,255,255,0.06)",
      gray: "rgba(0,0,0,0.06)",
      night: "rgba(255,255,255,0.04)",
    },
  },
} as const

export type MeterVerseGlass = typeof glass
