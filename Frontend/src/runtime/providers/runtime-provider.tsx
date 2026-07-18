"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { RuntimeKernel } from "../kernel/runtime"
import type { RuntimeContext } from "../contracts/runtime"

const RuntimeContext = createContext<RuntimeContext | null>(null)

let globalKernel: RuntimeKernel | null = null

export function getRuntime(): RuntimeContext {
  if (!globalKernel) throw new Error("Runtime not initialized. Wrap your app with RuntimeProvider.")
  return globalKernel
}

export function RuntimeProvider({ children, options }: { children: ReactNode; options?: Record<string, unknown> }) {
  const [kernel] = useState(() => {
    if (!globalKernel) {
      globalKernel = new RuntimeKernel(options)
      globalKernel.initialize()
    }
    return globalKernel
  })

  const value = useMemo(() => kernel as RuntimeContext, [kernel])

  useEffect(() => {
    return () => {
      kernel.destroyAll()
    }
  }, [kernel])

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
}

export function useRuntimeContext(): RuntimeContext {
  const ctx = useContext(RuntimeContext)
  if (!ctx) throw new Error("useRuntimeContext must be used within RuntimeProvider")
  return ctx
}
