export const shadow = {
  elevation: {
    0: { light: "none", dark: "none" },
    1: { light: "0 1px 2px rgba(0,0,0,0.04)", dark: "0 1px 2px rgba(0,0,0,0.3)" },
    2: { light: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)", dark: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)" },
    3: { light: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)", dark: "0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.35)" },
    4: { light: "0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)", dark: "0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.35)" },
    5: { light: "0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)", dark: "0 20px 25px rgba(0,0,0,0.45), 0 8px 10px rgba(0,0,0,0.4)" },
    6: { light: "0 25px 50px rgba(0,0,0,0.12)", dark: "0 25px 50px rgba(0,0,0,0.5)" },
    7: { light: "0 35px 60px rgba(0,0,0,0.15)", dark: "0 35px 60px rgba(0,0,0,0.6)" },
  },
  zIndex: {
    base: 0,
    sticky: 10,
    nav: 20,
    popover: 30,
    overlay: 40,
    modal: 50,
    banner: 60,
    spinner: 70,
    sidebar: 30,
    floating: 40,
    tooltip: 60,
    dropdown: 50,
  },
} as const

export type MeterVerseShadow = typeof shadow
