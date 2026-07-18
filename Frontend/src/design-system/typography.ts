export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    arabic: "'Cairo', 'Noto Sans Arabic', sans-serif",
  },
  fontSize: {
    display: { size: "32px", lineHeight: 1.15, weight: 700 },
    h1: { size: "24px", lineHeight: 1.2, weight: 600 },
    h2: { size: "20px", lineHeight: 1.25, weight: 600 },
    h3: { size: "16px", lineHeight: 1.4, weight: 600 },
    h4: { size: "14px", lineHeight: 1.4, weight: 600 },
    body: { size: "14px", lineHeight: 1.6, weight: 400 },
    bodyLarge: { size: "15px", lineHeight: 1.5, weight: 400 },
    small: { size: "13px", lineHeight: 1.5, weight: 400 },
    caption: { size: "12px", lineHeight: 1.5, weight: 400 },
    label: { size: "11px", lineHeight: 1.2, weight: 500 },
    code: { size: "13px", lineHeight: 1.6, weight: 400, family: "'JetBrains Mono', monospace" },
    monoXs: { size: "11px", lineHeight: 1.5, weight: 400, family: "'JetBrains Mono', monospace" },
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  arabic: {
    body: { size: "14px", lineHeight: 1.8, weight: 400 },
    display: { size: "34px", lineHeight: 1.2, weight: 700 },
  },
  scale: {
    xs: "11px",
    sm: "12px",
    base: "14px",
    lg: "16px",
    xl: "18px",
    "2xl": "22px",
    "3xl": "28px",
    "4xl": "38px",
    "5xl": "54px",
  },
} as const

export type MeterVerseTypography = typeof typography
