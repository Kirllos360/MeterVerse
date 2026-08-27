"use client"

// Chat tab for InspectorPanel — member list with pin, favorite, chat options
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const SAMPLE_MEMBERS = [
  { id: "1", name: "Ahmed Hassan", role: "Admin", online: true, avatar: "AH" },
  { id: "2", name: "Sarah Mohamed", role: "Billing", online: true, avatar: "SM" },
  { id: "3", name: "Omar Ali", role: "Field Tech", online: false, avatar: "OA" },
  { id: "4", name: "Lina Khaled", role: "Manager", online: true, avatar: "LK" },
  { id: "5", name: "Youssef Nader", role: "Support", online: false, avatar: "YN" },
]

const STORAGE_KEY_PINNED = "mv-chat-pinned"
const STORAGE_KEY_FAVORITES = "mv-chat-favorites"

export function ChatTab() {
  const [members] = useState(SAMPLE_MEMBERS)
  const [pinned, setPinned] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEY_PINNED)
      const f = localStorage.getItem(STORAGE_KEY_FAVORITES)
      if (p) setPinned(JSON.parse(p))
      if (f) setFavorites(JSON.parse(f))
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(pinned)) }, [pinned])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites)) }, [favorites])

  const togglePin = (id: string) => {
    if (pinned.includes(id)) setPinned(pinned.filter(x => x !== id))
    else if (pinned.length < 5) setPinned([...pinned, id])
  }

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(x => x !== id))
    else setFavorites([...favorites, id])
  }

  const sortedMembers = [...members].toSorted((a, b) => {
    const aPin = pinned.includes(a.id) ? 0 : 1
    const bPin = pinned.includes(b.id) ? 0 : 1
    if (aPin !== bPin) return aPin - bPin
    return 0
  })

  return (
    <div className="flex-1 flex flex-col p-3 space-y-1 overflow-y-auto" style={{ backgroundColor: "var(--toolbar-surface)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>Team Members</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{members.filter(m => m.online).length} online</span>
      </div>

      {sortedMembers.map(m => {
        const isPinned = pinned.includes(m.id)
        const isFavorite = favorites.includes(m.id)
        return (
          <motion.div key={m.id} layout className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04] relative" style={{ borderBottom: "1px solid var(--border-default)" }}>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: m.online ? "var(--brand)" : "var(--toolbar-surface)", color: "#FFFFFF" }}>
              {m.avatar}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                {isFavorite && <span className="text-[9px]" style={{ color: "var(--brand)" }}>★</span>}
                {m.online && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#DC2626" }} />}
              </div>
              <div className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{m.role}</div>
            </div>
            {/* 3-dot menu */}
            <div className="relative">
              <button onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)} aria-label="Toggle menu"
                className="w-5 h-5 flex items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: "var(--text-tertiary)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
              </button>
              <AnimatePresence>
                {openMenu === m.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-40 rounded-xl z-50 overflow-hidden shadow-lg"
                    style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}
                    onClick={() => setOpenMenu(null)}>
                    {[
                      { label: isPinned ? "Unpin" : "Pin", action: () => togglePin(m.id) },
                      { label: isFavorite ? "Remove from Favorites" : "Add to Favorites", action: () => toggleFavorite(m.id) },
                      { label: "Chat", action: () => {} },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: "var(--text-primary)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {i === 0 ? <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /> : i === 1 ? <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> : <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />}
                        </svg>
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
