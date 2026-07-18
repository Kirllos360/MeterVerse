"use client"

import { useCallback, useEffect, useState } from "react"
import { useWorkspaceStore } from "@/workspace/stores"

type Messages = Record<string, Record<string, string | Record<string, string>>>

const messageCache: Record<string, Messages> = {}

function loadMessages(locale: string): Messages {
  if (messageCache[locale]) return messageCache[locale]
  try {
    // Use require for synchronous loading (more reliable than dynamic import)
    const messages = require(`../../messages/${locale}.json`) as Messages
    messageCache[locale] = messages
    return messages
  } catch {
    return {} as Messages
  }
}

// Pre-load both languages at module init
const enMessages = loadMessages("en")
const arMessages = loadMessages("ar")
messageCache["en"] = enMessages
messageCache["ar"] = arMessages

export function useTranslation() {
  const { language } = useWorkspaceStore()
  const [messages, setMessages] = useState<Messages>(messageCache[language] || messageCache["en"])
  const dir = language === "ar" ? "rtl" : "ltr"

  useEffect(() => {
    const msgs = messageCache[language]
    if (msgs) setMessages(msgs)
  }, [language])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const parts = key.split(".")
      let current: unknown = messages
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part]
        } else {
          return fallback || key
        }
      }
      return typeof current === "string" ? current : fallback || key
    },
    [messages]
  )

  return { t, dir, language }
}
