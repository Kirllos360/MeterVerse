"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

function ConnectionHeader() {
  const [status, setStatus] = useState("online")
  useEffect(() => {
    const check = () => fetch("/api/health").then(r => setStatus(r.ok ? "online" : "degraded")).catch(() => setStatus("offline"))
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-1.5 px-2">
      <motion.span animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className={`w-2 h-2 rounded-full shrink-0 ${status === "online" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--toolbar-muted)" }}>
        <path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><circle cx="12" cy="20" r="1" />
      </svg>
      <span className="text-[9px] font-semibold capitalize" style={{ color: "var(--toolbar-muted)" }}>{status}</span>
    </div>
  )
}

function TbBtn({ children, label, onClick, isActive }: { children: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95" style={{ color: isActive ? "var(--admin-accent)" : "var(--toolbar-muted)" }} title={label} aria-label={label}>
      {children}
    </button>
  )
}

const MODE_ICONS: Record<string, string> = { light: "☀️", dark: "🌙", auto: "⚙️" }
const t = (lang: string, en: string, ar: string) => lang === "ar" ? ar : en

export function AdminToolbar({ activePage, onToggleInspector, themeMode = "auto", onCycleTheme, effectiveDark, lang = "en", onToggleLang, onLogoClick, systemTitle = "Administration", themeColor }: any) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [showTasks, setShowTasks] = useState(false)
  const [showReminders, setShowReminders] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const tasksRef = useRef<HTMLDivElement>(null)
  const remindersRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchQuery("")
      }
      if (tasksRef.current && !tasksRef.current.contains(e.target as Node)) setShowTasks(false)
      if (remindersRef.current && !remindersRef.current.contains(e.target as Node)) setShowReminders(false)
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false)
    }
    if (searchOpen || showTasks || showReminders || showNotifications) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [searchOpen, showTasks, showReminders, showNotifications])

  const tasks = [
    { id: 1, label: "Set up new meter MTR-8842", done: false, priority: "high" },
    { id: 2, label: "Review invoice #INV-2024-331", done: false, priority: "medium" },
    { id: 3, label: "Update customer contact info", done: true, priority: "low" },
    { id: 4, label: "Generate monthly consumption report", done: false, priority: "high" },
  ]

  const reminders = [
    { id: 1, text: "Team standup meeting", time: "Today, 9:00 AM", icon: "M12 6v6l4 2" },
    { id: 2, text: "Submit monthly report", time: "Today, 5:00 PM", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: 3, text: "Review meter calibration", time: "Tomorrow, 10:00 AM", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]

  const notifications = [
    { id: 1, title: "New meter registered", body: "Meter #MTR-8842 has been registered to Customer #C-1024", time: "2 min ago", read: false },
    { id: 2, title: "Invoice paid", body: "Invoice #INV-2024-331 has been paid successfully", time: "1 hour ago", read: false },
    { id: 3, title: "System update deployed", body: "Platform was updated to v3.2.1 with new features", time: "Yesterday", read: true },
    { id: 4, title: "Data sync complete", body: "All meter readings synchronized across regions", time: "2 days ago", read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const searchItems = [
    { cat: "Pages", items: [
      { label: "Home", id: "home" }, { label: "Customers", id: "customers" }, { label: "Meters", id: "meters" },
      { label: "Invoices", id: "invoices" }, { label: "Payments", id: "payments" }, { label: "Users", id: "users" },
      { label: "Settings", id: "settings" }, { label: "Monitoring", id: "monitoring" },
    ]},
    { cat: "Tools", items: [
      { label: "API Explorer", action: "inspector" }, { label: "RCA Workspace", id: "rca-workspace" },
      { label: "AI Command Center", id: "ai-command-center" }, { label: "Audit Log", id: "audit" },
    ]},
  ]

  const filteredSearch = searchQuery.trim()
    ? searchItems.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
    : []

  return (
    <div className="flex items-center h-14 px-4 gap-3 shrink-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "var(--toolbar-bg)", borderBottom: "1px solid var(--toolbar-border)" }}>
      
      {/* Logo — clickable, pulsating circle + Meter Verse name */}
      <motion.button onClick={onLogoClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2.5 min-w-0 shrink-0 rounded-xl px-1 py-1">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)", boxShadow: "0 0 15px rgba(var(--brand-rgb),0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </motion.div>
        <div className="hidden md:block leading-tight text-left">
          <div className="text-sm font-bold tracking-tight" style={{ color: "var(--toolbar-text)" }}>Meter Verse</div>
          <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--toolbar-muted)" }}>{systemTitle}</div>
        </div>
      </motion.button>

      {/* Search — centered, with wave border */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-auto">
        {/* Filter chips */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute -top-7 left-1 flex gap-1 z-10">
              {["All", "Pages", "Tools"].map(f => (
                <button key={f} onClick={() => {}}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all"
                  style={{ backgroundColor: f === "All" ? "var(--brand)" : "var(--toolbar-surface)", color: f === "All" ? "#FFFFFF" : "var(--text-tertiary)" }}>
                  {f}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ width: searchOpen ? "100%" : "280px" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative flex items-center search-wave"
          style={{ backgroundColor: effectiveDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderRadius: "12px", border: `2px solid ${themeColor || "#DC2626"}33`, boxShadow: searchOpen ? `0 0 25px ${themeColor || "#DC2626"}1A` : `0 0 10px ${themeColor || "#DC2626"}0A` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 shrink-0" style={{ color: "var(--toolbar-muted)" }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input ref={searchRef} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }} onFocus={() => setSearchOpen(true)}
            placeholder="Search pages, tools, settings..." className="w-full bg-transparent outline-none text-xs py-2.5 pl-9 pr-3 font-semibold"
            style={{ color: "var(--toolbar-text)" }} />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false) }} className="absolute right-2 text-[10px] p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: "var(--toolbar-muted)" }}>✕</button>
          )}
        </motion.div>

        {/* Search dropdown with filters inside */}
        <AnimatePresence>
          {searchOpen && filteredSearch.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-lg"
              style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
              {filteredSearch.map(group => (
                <div key={group.cat} className="p-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider px-2 py-1" style={{ color: "var(--text-tertiary)" }}>{group.cat}</p>
                  {group.items.map(item => (
                    <button key={item.label} className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--text-primary)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        <TbBtn label={t(lang, "Toggle Inspector", "إظهار/إخفاء المفتش")} onClick={() => onToggleInspector?.()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
        </TbBtn>

        <ConnectionHeader />

        {/* Tasks */}
        <div ref={tasksRef} className="relative">
          <TbBtn label={t(lang, "Tasks", "المهام")} onClick={() => { setShowTasks(!showTasks); setShowReminders(false); setShowNotifications(false) }} isActive={showTasks}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.615 20H7a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8" />
              <path d="M14 19l3 3 5-5" />
              <path d="M9 8h6" />
              <path d="M9 12h4" />
            </svg>
          </TbBtn>
          <AnimatePresence>
            {showTasks && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-72 rounded-xl z-[9999] overflow-hidden shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t(lang, "Tasks", "المهام")}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--brand)", color: "#FFFFFF" }}>{tasks.filter(t => !t.done).length}</span>
                  </div>
                </div>
                <div className="p-1.5 max-h-60 overflow-y-auto">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      <div className={`w-4 h-4 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${task.done ? "bg-green-500 border-green-500" : ""}`} style={{ borderColor: task.done ? "var(--green)" : "var(--border-default)" }}>
                        {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold block ${task.done ? "line-through opacity-50" : ""}`} style={{ color: "var(--text-primary)" }}>{task.label}</span>
                        <span className={`text-[10px] font-medium ${task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-yellow-500" : "text-gray-400"}`}>{task.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-1.5" style={{ borderColor: "var(--border-default)" }}>
                  <button className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--brand)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    {t(lang, "View All Tasks", "عرض جميع المهام")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reminders */}
        <div ref={remindersRef} className="relative">
          <TbBtn label={t(lang, "Reminders", "التذكيرات")} onClick={() => { setShowReminders(!showReminders); setShowTasks(false); setShowNotifications(false) }} isActive={showReminders}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 01-6 6H9" />
              <path d="M6 21l3-3-3-3" />
              <path d="M15 6a3 3 0 10-6 0" />
              <path d="M6 14l3 3-3 3" />
            </svg>
          </TbBtn>
          <AnimatePresence>
            {showReminders && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-72 rounded-xl z-[9999] overflow-hidden shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t(lang, "Reminders", "التذكيرات")}</span>
                </div>
                <div className="p-1.5 max-h-60 overflow-y-auto">
                  {reminders.map(r => (
                    <div key={r.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--brand)", opacity: 0.15 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={r.icon} /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>{r.text}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{r.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-1.5" style={{ borderColor: "var(--border-default)" }}>
                  <button className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--brand)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    {t(lang, "Add Reminder", "إضافة تذكير")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <TbBtn label={t(lang, "Notifications", "الإشعارات")} onClick={() => { setShowNotifications(!showNotifications); setShowTasks(false); setShowReminders(false) }} isActive={showNotifications}>
            <span className="relative">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
                  {unreadCount}
                </span>
              )}
            </span>
          </TbBtn>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-80 rounded-xl z-[9999] overflow-hidden shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t(lang, "Notifications", "الإشعارات")}</span>
                  {unreadCount > 0 && (
                    <button className="text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--brand)" }}>
                      {t(lang, "Mark all read", "تحديد الكل مقروء")}
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${!n.read ? "" : ""}`} style={{ backgroundColor: !n.read ? "color-mix(in srgb, var(--brand) 4%, transparent)" : "transparent" }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "opacity-0" : ""}`} style={{ backgroundColor: "var(--brand)" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{n.title}</span>
                          <span className="text-[9px] shrink-0" style={{ color: "var(--text-tertiary)" }}>{n.time}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{n.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TbBtn label={`${t(lang, "Theme", "المظهر")}: ${themeMode}`} onClick={() => onCycleTheme?.()}>
          <span className="text-sm">{MODE_ICONS[themeMode]}</span>
        </TbBtn>

        <TbBtn label={`${t(lang, "Language", "اللغة")}: ${lang.toUpperCase()}`} onClick={() => onToggleLang?.()}>
          <span className="text-xs font-bold">{lang.toUpperCase()}</span>
        </TbBtn>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1 active:scale-95">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
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
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-hidden shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}
                onClick={() => setShowUserMenu(false)}>
                <div className="p-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
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
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--text-primary)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t p-1" style={{ borderColor: "var(--border-default)" }}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--admin-accent)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
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
  return (
    <div className="flex items-center h-14 px-4 gap-2 text-xs shrink-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "var(--toolbar-bg)", borderTop: "1px solid var(--toolbar-border)", color: "var(--toolbar-muted)" }}>
      <span style={{ color: "var(--admin-accent)" }}>●</span>
      <span>All Systems Operational</span>
      <span style={{ color: "var(--toolbar-border)" }}>|</span>
      <span>78 Models · 165 APIs · 42 Pages</span>
      <div className="flex-1" />
      <span style={{ color: "var(--toolbar-muted)" }}>Powering progress, one meter at a time</span>
      {onToggleInspector && (
        <button onClick={onToggleInspector} className="flex items-center gap-1 text-[10px] outline-none transition-colors hover:opacity-80" style={{ color: inspectorOpen ? "var(--admin-accent)" : "var(--toolbar-muted)" }}>
          <motion.span animate={{ rotate: inspectorOpen ? 180 : 0 }}>◀</motion.span>
          <span>Inspector</span>
        </button>
      )}
    </div>
  )
}
