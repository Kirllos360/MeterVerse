"use client"

import { create } from "zustand"

export type NotificationType = "success" | "error" | "warning" | "info"
export type NotificationVariant = "toast" | "banner" | "in-app"

export interface Notification {
  id: string
  type: NotificationType
  variant: NotificationVariant
  title: string
  message?: string
  duration?: number
  read: boolean
  timestamp: number
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  maxVisible: number
  add: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  maxVisible: 5,

  add: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    }
    set((s) => ({
      notifications: [newNotification, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    }))
    if (notification.duration !== 0) {
      setTimeout(
        () => {
          const stillExists = get().notifications.find((n) => n.id === id)
          if (stillExists) get().dismiss(id)
        },
        notification.duration || 5000
      )
    }
  },

  dismiss: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  dismissAll: () => set({ notifications: [], unreadCount: 0 }),

  markRead: (id) =>
    set((s) => {
      const notification = s.notifications.find((n) => n.id === id)
      if (!notification || notification.read) return s
      return {
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}))
