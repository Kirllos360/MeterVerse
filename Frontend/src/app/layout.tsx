import { Toaster } from "@/components/ui/sonner"
import { DevAuthInit } from "@/components/effects/DevAuthInit"
import { fontVariables } from "@/components/themes/font.config"
import { DEFAULT_THEME, THEMES } from "@/components/themes/theme.config"
import ThemeProvider from "@/components/themes/theme-provider"
import { ActiveThemeProvider } from "@/components/themes/active-theme"
import { cn } from "@/lib/utils"
import type { Metadata, Viewport } from "next"
import { cookies, headers } from "next/headers"
import NextTopLoader from "nextjs-toploader"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { RuntimeProvider } from "@/runtime/workspace/workspace-runtime"
import { InfobarProvider } from "@/components/ui/infobar"
import QueryProvider from "@/components/layout/query-provider"
import "../styles/globals.css"

const META_THEME_COLORS = { light: "#ffffff", dark: "#09090b" }

export const metadata: Metadata = {
  title: "MeterVerse OS",
  description: "Enterprise Utility Operating System",
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const activeThemeValue = cookieStore.get("active_theme")?.value
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue)
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME
  const lang = cookieStore.get("mv_language")?.value || "en"
  const dir = lang === "ar" ? "rtl" : "ltr"
  // P57-FIX (permanent): derive profile from the REQUEST PORT (authoritative),
  // with env as fallback. Port 3030 = portal, 3535 = admin. This guarantees the
  // two ports can never serve the same profile, even if PORTAL_MODE is mis-set.
  const headerStore = await headers()
  const host = headerStore.get("host") || ""
  const port = host.split(":")[1] || ""
  const profile = (port === "3030" || process.env.PORTAL_MODE === "1") ? "portal" : "admin"

  return (
    <html lang={lang} dir={dir} data-profile={profile} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className={cn("bg-background overflow-x-hidden overscroll-none font-sans antialiased", fontVariables)}>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <DevAuthInit />
        <NuqsAdapter>
          <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange enableColorScheme>
            <ActiveThemeProvider initialTheme={themeToApply}>
              <QueryProvider>
                <RuntimeProvider>
                  <InfobarProvider>
                    <Toaster />
                    {children}
                  </InfobarProvider>
                </RuntimeProvider>
              </QueryProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
