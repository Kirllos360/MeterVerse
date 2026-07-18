import { create } from "zustand"

export type WindowState = "normal" | "minimized" | "maximized" | "fullscreen" | "snapped-left" | "snapped-right"

export interface WindowV2 {
  id: string
  title: string
  appId?: string
  state: WindowState
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  route?: string
}

interface WindowManagerV2State {
  windows: WindowV2[]
  nextZIndex: number
  openWindow: (win: Omit<WindowV2, "zIndex" | "state" | "x" | "y" | "width" | "height">) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  fullscreenWindow: (id: string) => void
  snapLeft: (id: string) => void
  snapRight: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, w: number, h: number) => void
  getActiveWindow: () => WindowV2 | undefined
}

export const useWindowManagerV2 = create<WindowManagerV2State>((set, get) => ({
  windows: [],
  nextZIndex: 100,

  openWindow: (win) => {
    const id = win.id || `win-${Date.now()}`
    set((s) => ({
      windows: [...s.windows, {
        ...win, id, state: "normal",
        x: 100 + s.windows.length * 30, y: 100 + s.windows.length * 30,
        width: 600, height: 400, zIndex: s.nextZIndex,
      }],
      nextZIndex: s.nextZIndex + 1,
    }))
    return id
  },

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  focusWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, zIndex: s.nextZIndex } : w), nextZIndex: s.nextZIndex + 1 })),
  minimizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: "minimized" } : w) })),
  maximizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: "maximized" } : w) })),
  restoreWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: "normal" } : w) })),
  fullscreenWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: w.state === "fullscreen" ? "normal" : "fullscreen" } : w) })),
  snapLeft: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: "snapped-left", x: 0, y: 0, width: window.innerWidth / 2, height: window.innerHeight } : w) })),
  snapRight: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, state: "snapped-right", x: window.innerWidth / 2, y: 0, width: window.innerWidth / 2, height: window.innerHeight } : w) })),
  moveWindow: (id, x, y) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, x, y } : w) })),
  resizeWindow: (id, width, height) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, width, height } : w) })),
  getActiveWindow: () => get().windows.find((w) => w.zIndex === get().nextZIndex - 1),
}))
