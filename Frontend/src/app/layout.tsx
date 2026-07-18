import { Toaster } from "@/components/ui/sonner"
import { fontVariables } from "@/components/themes/font.config"
import { DEFAULT_THEME, THEMES } from "@/components/themes/theme.config"
import ThemeProvider from "@/components/themes/theme-provider"
import { ActiveThemeProvider } from "@/components/themes/active-theme"
import { cn } from "@/lib/utils"
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import NextTopLoader from "nextjs-toploader"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { RuntimeProvider } from "@/runtime/workspace/workspace-runtime"
import { PermissionProvider } from "@/providers/permission-context"
import { InfobarProvider } from "@/components/ui/infobar"
import { AuthProvider } from "@/providers/auth-context"
import QueryProvider from "@/components/layout/query-provider"
import "../styles/globals.css"

const META_THEME_COLORS = { light: "#ffffff", dark: "#09090b" }

export const metadata: Metadata = {
  title: "MeterVerse Enterprise OS",
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

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("bg-background overflow-x-hidden overscroll-none font-sans antialiased", fontVariables)}>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange enableColorScheme>
            <ActiveThemeProvider initialTheme={themeToApply}>
              <QueryProvider>
                <RuntimeProvider>
                  <PermissionProvider>
                    <AuthProvider>
                      <InfobarProvider>
                      <Toaster />
                      {children}
                  </InfobarProvider>
                </AuthProvider>
              </PermissionProvider>
            </RuntimeProvider>
              </QueryProvider>
            </ActiveThemeProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
