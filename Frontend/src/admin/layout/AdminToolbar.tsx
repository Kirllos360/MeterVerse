"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

function TbBtn({ children, label, onClick, isActive }: { children: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: isActive ? "var(--admin-accent)" : "var(--toolbar-muted)" }} title={label} aria-label={label}>
      {children}
    </button>
  )
}

const MODE_ICONS: Record<string, string> = { light: "☀️", dark: "🌙", auto: "⚙️" }
const t = (lang: string, en: string, ar: string) => lang === "ar" ? ar : en

export function AdminToolbar({ activePage, onToggleInspector, themeMode = "auto", onCycleTheme, effectiveDark, lang = "en", onToggleLang }: any) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="flex items-center h-14 px-4 gap-2" style={{ backdropFilter: "blur(var(--toolbar-blur))", WebkitBackdropFilter: "blur(var(--toolbar-blur))", backgroundColor: "var(--toolbar-bg)", borderBottom: "1px solid var(--toolbar-border)" }}>
      
      {/* Logo + Breadcrumb */}
      <div className="flex items-center gap-3 text-sm min-w-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--admin-accent)", boxShadow: "0 0 10px rgba(220,38,38,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-sm font-bold tracking-tight hidden md:inline" style={{ color: "var(--toolbar-text)" }}>MeterVerse</span>
        </div>
        <span style={{ color: "var(--toolbar-muted)" }} className="hidden sm:inline font-medium">{t(lang, "Admin", "الإدارة")}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden sm:block" style={{ color: "var(--toolbar-muted)" }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="hidden sm:inline font-semibold" style={{ color: "var(--toolbar-text)" }}>{activePage}</span>
      </div>

      <div className="flex-1" />

      {/* Right icons */}
      <div className="flex items-center gap-2 shrink-0">
        <TbBtn label={t(lang, "Toggle Inspector", "إظهار/إخفاء المفتش")} onClick={() => onToggleInspector?.()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
        </TbBtn>

        <TbBtn label={t(lang, "Notifications", "الإشعارات")} onClick={() => window.open("/admin/notifications", "_self")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </TbBtn>

        <TbBtn label={`${t(lang, "Theme", "المظهر")}: ${themeMode}`} onClick={() => onCycleTheme?.()}>
          <span className="text-sm">{MODE_ICONS[themeMode]}</span>
        </TbBtn>

        <TbBtn label={`${t(lang, "Language", "اللغة")}: ${lang.toUpperCase()}`} onClick={() => onToggleLang?.()}>
          <span className="text-xs font-bold">{lang.toUpperCase()}</span>
        </TbBtn>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "var(--admin-accent)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-sm font-bold tracking-tight" style={{ color: "var(--toolbar-text)" }}>Admin User</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--toolbar-muted)" }}>{t(lang, "Administrator", "مسؤول النظام")}</div>
            </div>
            <motion.svg animate={{ rotate: showUserMenu ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></motion.svg>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-56 rounded-xl z-50 overflow-hidden"
                style={{ backgroundColor: "var(--admin-surface)", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", border: "1px solid var(--admin-border)" }}
                onClick={() => setShowUserMenu(false)}>
                <div className="p-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: "var(--admin-accent)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Admin User</div>
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>admin@meterverse.com</div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  {[
                    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: t(lang, "My Profile", "ملفي الشخصي") },
                    { icon: "M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17", label: t(lang, "Account Settings", "إعدادات الحساب") },
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t(lang, "Security", "الأمان") },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--text-primary)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon} /></svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t p-1" style={{ borderColor: "var(--admin-border)" }}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors" style={{ color: "var(--admin-accent)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                    <span>{t(lang, "Sign Out", "تسجيل الخروج")}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function AdminStatusBar({ inspectorOpen, onToggleInspector, lang = "en" }: any) {
  const t = (en: string, ar: string) => lang === "ar" ? ar : en
  return (
    <div className="flex items-center h-14 px-4 gap-2 text-xs" style={{ backdropFilter: "blur(var(--toolbar-blur))", WebkitBackdropFilter: "blur(var(--toolbar-blur))", backgroundColor: "var(--toolbar-bg)", borderTop: "1px solid var(--toolbar-border)", color: "var(--toolbar-muted)" }}>
      <span style={{ color: "var(--admin-accent)" }}>●</span>
      <span>{t("All Systems Operational", "جميع الأنظمة تعمل")}</span>
      <span style={{ color: "var(--toolbar-border)" }}>|</span>
      <span>78 {t("Models", "نموذج")} · 165 APIs · 42 {t("Pages", "صفحة")}</span>
      <div className="flex-1" />
      <span style={{ color: "var(--toolbar-muted)" }}>{t("Powering progress, one meter at a time", "نُحرز التقدم، عدادًا بعد عداد")}</span>
      {onToggleInspector && (
        <button onClick={onToggleInspector} className="flex items-center gap-1 text-[10px] outline-none" style={{ color: inspectorOpen ? "var(--admin-accent)" : "var(--toolbar-muted)", cursor: "pointer", background: "none", border: "none" }}>
          <motion.span animate={{ rotate: inspectorOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>◀</motion.span>
          <span>{t("Inspector", "المفتش")}</span>
        </button>
      )}
    </div>
  )
}

