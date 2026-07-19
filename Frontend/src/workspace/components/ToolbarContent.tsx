"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { useThemeMode } from "@/hooks/use-theme-mode"
import { useDirection } from "@/hooks/use-direction"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"
import { GlobalSearch } from "@/components/effects/GlobalSearch"

interface ToolbarContentProps {
  onToggleInspector?: () => void
}

const MODE_ICONS: Record<string, string> = {
  light: "\u2600",
  dark: "\u263D",
  system: "\u25D0",
}

export function ToolbarContent({ onToggleInspector }: ToolbarContentProps) {
  const { area, inspectorOpen } = useWorkspaceStore()
  const { mode, cycleMode } = useThemeMode()
  const { language, toggleLanguage } = useDirection()
  const { logout } = useAuthRuntime()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showReminders, setShowReminders] = useState(false)
  const [reminderMode, setReminderMode] = useState<"list" | "add">("list")
  const [newReminder, setNewReminder] = useState("")
  const [reminders, setReminders] = useState([
    { icon: "📋", title: "12 invoices pending review", time: "2h", color: "var(--status-warning)" },
    { icon: "🔔", title: "3 meters require maintenance", time: "1d", color: "var(--status-error)" },
    { icon: "📈", title: "Monthly report ready", time: "3h", color: "var(--brand)" },
    { icon: "✅", title: "All systems operational", time: "5m", color: "var(--status-success)" },
    { icon: "⚡", title: "Peak consumption today", time: "1h", color: "#3B82F6" },
  ])

  return (
    <div className="flex items-center h-14 px-4 gap-3 font-semibold tracking-wide" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
      {/* Left: System Name + Breadcrumb */}
      <div className="flex items-center gap-3 text-sm min-w-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-sm font-bold tracking-tight hidden md:inline" style={{ color: "var(--text-primary)" }}>MeterVerse</span>
        </div>
        <span style={{ color: "var(--text-tertiary)" }} className="hidden sm:inline font-medium">{language === "ar" ? "مساحة العمل" : "Workspace"}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden sm:block" style={{ color: "var(--text-tertiary)" }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="hidden sm:inline font-semibold" style={{ color: "var(--text-primary)" }}>{area}</span>
      </div>

      {/* Center: Search */}
      <div className="flex-[2] max-w-4xl mx-auto hidden md:block">
        <GlobalSearch />
      </div>

      {/* Right: Controls + User */}
      <div className="flex items-center gap-2 shrink-0">
        <ToolbarButton label={inspectorOpen ? (language === "ar" ? "إخفاء" : "Hide Inspector") : (language === "ar" ? "إظهار" : "Show Inspector")} onClick={() => onToggleInspector?.()} isActive={inspectorOpen}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
        </ToolbarButton>
        <ToolbarButton label={language === "ar" ? "الإشعارات" : "Notifications"} onClick={() => {}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </ToolbarButton>
        <ToolbarButton label={language === "ar" ? "التذكيرات" : "Reminders"} onClick={() => setShowReminders(!showReminders)} isActive={showReminders}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
        </ToolbarButton>
        <ToolbarButton label={language === "ar" ? "الوضع" : `Mode: ${mode}`} onClick={cycleMode}>
          <span className="text-sm">{MODE_ICONS[mode] || MODE_ICONS.system}</span>
        </ToolbarButton>
        <ToolbarButton label={language === "ar" ? "اللغة" : `Language: ${language.toUpperCase()}`} onClick={toggleLanguage}>
          <span className="text-xs font-bold">{language.toUpperCase()}</span>
        </ToolbarButton>

        {/* Reminders Popup */}
        <AnimatePresence>
          {showReminders && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-44 top-full mt-2 w-80 rounded-xl z-50 overflow-hidden"
              style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border-default)" }}>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {reminderMode === "add" ? (language === "ar" ? "إضافة تذكير" : "Add Reminder") : (language === "ar" ? "التذكيرات" : "Reminders")}
                </span>
                <button onClick={() => setReminderMode(reminderMode === "add" ? "list" : "add")} className="text-xs font-medium" style={{ color: "var(--brand)" }}>
                  {reminderMode === "add" ? (language === "ar" ? "رجوع" : "Back") : (language === "ar" ? "+ إضافة" : "+ Add")}
                </button>
              </div>

              {reminderMode === "add" ? (
                /* Add Reminder Form */
                <div className="p-3 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{language === "ar" ? "التذكير" : "Reminder"}</label>
                    <input value={newReminder} onChange={(e) => setNewReminder(e.target.value)} placeholder={language === "ar" ? "أدخل التذكير..." : "Enter reminder..."}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--brand)] transition-colors"
                      style={{ backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
                  </div>
                  <div className="flex gap-2">
                    <select className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none bg-transparent"
                      style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                      <option value="today">{language === "ar" ? "اليوم" : "Today"}</option>
                      <option value="tomorrow">{language === "ar" ? "غداً" : "Tomorrow"}</option>
                      <option value="week">{language === "ar" ? "هذا الأسبوع" : "This week"}</option>
                    </select>
                    <select className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none bg-transparent"
                      style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                      <option value="high">{language === "ar" ? "عالية" : "High"}</option>
                      <option value="medium">{language === "ar" ? "متوسطة" : "Medium"}</option>
                      <option value="low">{language === "ar" ? "منخفضة" : "Low"}</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { if (newReminder.trim()) { setReminders([{ icon: "📌", title: newReminder, time: "Now", color: "var(--brand)" }, ...reminders]); setNewReminder(""); setReminderMode("list") } }}
                    className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: newReminder.trim() ? "var(--brand)" : "rgba(var(--brand-rgb), 0.3)" }}
                    disabled={!newReminder.trim()}
                  >
                    {language === "ar" ? "إضافة" : "Add Reminder"}
                  </motion.button>
                </div>
              ) : (
                /* Reminders List */
                <div className="max-h-60 overflow-y-auto">
                  {reminders.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-3 border-b last:border-b-0 group" style={{ borderColor: "var(--border-default)" }}>
                      <span className="text-lg mt-0.5">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: "var(--text-primary)" }}>{r.title}</div>
                        <div className="text-[10px] mt-0.5 font-medium" style={{ color: r.color }}>{r.time} {language === "ar" ? "مضت" : "ago"}</div>
                      </div>
                      <button onClick={() => setReminders(reminders.filter((_, idx) => idx !== i))} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>



        {/* User Avatar + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-secondary))" }}>AU</div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Admin User</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>Administrator</div>
            </div>
            <motion.svg animate={{ rotate: showUserMenu ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></motion.svg>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl z-50 overflow-hidden"
                style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }}
                onClick={() => setShowUserMenu(false)}
              >
                <div className="p-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-secondary))" }}>AU</div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Admin User</div>
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>admin@meterverse.com</div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  {[
                    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: "My Profile", labelAr: "الملف الشخصي" },
                    { icon: "M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17", label: "Account Settings", labelAr: "إعدادات الحساب" },
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Security", labelAr: "الأمان" },
                  ].map((item, i) => (
                    <button key={i}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon} /></svg>
                      <span>{language === "ar" ? item.labelAr : item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t p-1" style={{ borderColor: "var(--border-default)" }}>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    style={{ color: "var(--status-error)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                    <span>{language === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
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

function ToolbarButton({ children, label, onClick, isActive }: { children: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: isActive ? "var(--brand)" : "var(--text-secondary)" }} title={label} aria-label={label}>
      {children}
    </button>
  )
}



