import { colors } from "./colors"
import { spacing } from "./spacing"
import { radius } from "./radius"
import { shadow } from "./shadow"
import { motionPresets } from "./motion"
import { typography } from "./typography"
import { glass } from "./glass"
import { sidebar } from "./sidebar"
import { workspace } from "./workspace"
import { themeDefaults, themeModes } from "./theme"
import type { MeterVerseColors } from "./colors"
import type { MeterVerseSpacing } from "./spacing"
import type { MeterVerseRadius } from "./radius"
import type { MeterVerseShadow } from "./shadow"
import type { MeterVerseMotion } from "./motion"
import type { MeterVerseTypography } from "./typography"
import type { MeterVerseGlass } from "./glass"
import type { MeterVerseSidebar } from "./sidebar"
import type { MeterVerseWorkspace } from "./workspace"
import type { ThemeConfig, ThemeMode } from "./theme"

export const tokens = {
  colors,
  spacing,
  radius,
  shadow,
  motion: motionPresets,
  typography,
  glass,
  sidebar,
  workspace,
  theme: { defaults: themeDefaults, modes: themeModes },
} as const

export type MeterVerseTokens = typeof tokens

export type {
  MeterVerseColors,
  MeterVerseSpacing,
  MeterVerseRadius,
  MeterVerseShadow,
  MeterVerseMotion,
  MeterVerseTypography,
  MeterVerseGlass,
  MeterVerseSidebar,
  MeterVerseWorkspace,
  ThemeConfig,
  ThemeMode,
}
