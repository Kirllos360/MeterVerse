import { create } from "zustand"

export type WindowType = "dialog" | "drawer" | "modal" | "floating" | "inspector" | "panel"
export type WindowSize = "sm" | "md" | "lg" | "xl" | "full"

export interface WindowInstance {
  id: string
  type: WindowType
  title?: string
  size: WindowSize
  content?: string
  x?: number
  y?: number
  width?: number
  height?: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  resizable: boolean
  draggable: boolean
  closable: boolean
}

interface WindowState {
  windows: WindowInstance[]
  nextZIndex: number
  activeWindowId: string | null
  open: (config: Omit<WindowInstance, "zIndex" | "minimized" | "maximized">) => string
  close: (id: string) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  maximize: (id: string) => void
  restore: (id: string) => void
  move: (id: string, x: number, y: number) => void
  resize: (id: string, width: number, height: number) => void
  closeAll: () => void
  getActiveWindow: () => WindowInstance | undefined
}

let windowCount = 0

export const useWindowManager = create<WindowState>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  activeWindowId: null,

  open: (config) => {
    const id = config.id || `window-${++windowCount}`
    const zIndex = get().nextZIndex
    set((s) => ({
      windows: [...s.windows, { ...config, id, zIndex, minimized: false, maximized: false }],
      nextZIndex: zIndex + 1,
      activeWindowId: id,
    }))
    return id
  },

  close: (id) =>
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      activeWindowId: s.activeWindowId === id ? null : s.activeWindowId,
    })),

  focus: (id) =>
    set((s) => ({
      activeWindowId: id,
      nextZIndex: s.nextZIndex + 1,
      windows: s.windows.map((w) => (w.id === id ? { ...w, zIndex: s.nextZIndex } : w)),
    })),

  minimize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    })),

  maximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    })),

  restore: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false, maximized: false } : w)),
    })),

  move: (id, x, y) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),

  resize: (id, width, height) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
    })),

  closeAll: () => set({ windows: [], activeWindowId: null }),

  getActiveWindow: () => {
    const { windows, activeWindowId } = get()
    return windows.find((w) => w.id === activeWindowId)
  },
}))
