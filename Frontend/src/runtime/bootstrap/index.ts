import { RuntimeKernel } from "../kernel/runtime"
import type { RuntimeContext, RuntimeOptions } from "../contracts/runtime"
import { SnapshotEngineImpl } from "../snapshot/engine"
import { RuntimeEventTypes } from "../events/runtime-events"

export interface BootstrapResult {
  kernel: RuntimeContext
  snapshot: SnapshotEngineImpl
  cleanup: () => void
}

export async function bootstrapRuntime(options: RuntimeOptions = {}): Promise<BootstrapResult> {
  const kernel = new RuntimeKernel(options)
  const snapshot = new SnapshotEngineImpl(options.storageKey || "mv:runtime")

  // Initialize kernel
  await kernel.initialize()

  // Try to restore previous session
  if (snapshot.hasSnapshot()) {
    const saved = snapshot.load()
    if (saved) {
      await kernel.restore(saved)
    }
  }

  // Auto-save on page visibility change
  const handleVisibility = () => {
    if (document.visibilityState === "hidden") {
      snapshot.save(kernel)
    }
  }
  document.addEventListener("visibilitychange", handleVisibility)

  // Auto-save on beforeunload
  const handleBeforeUnload = () => {
    snapshot.save(kernel)
  }
  window.addEventListener("beforeunload", handleBeforeUnload)

  // Periodic auto-save
  const autoSaveInterval = options.autoSnapshot !== false
    ? setInterval(() => snapshot.save(kernel), options.snapshotInterval || 30000)
    : null

  const cleanup = () => {
    document.removeEventListener("visibilitychange", handleVisibility)
    window.removeEventListener("beforeunload", handleBeforeUnload)
    if (autoSaveInterval) clearInterval(autoSaveInterval)
  }

  return { kernel, snapshot, cleanup }
}

export { RuntimeKernel } from "../kernel/runtime"
export { RuntimeEventTypes } from "../events/runtime-events"
export { SnapshotEngineImpl } from "../snapshot/engine"
export { RuntimeProvider, getRuntime, useRuntimeContext } from "../providers/runtime-provider"
export { useRuntime, useProgram, useFocus, useSelection, useHistory } from "../hooks/useRuntime"
export { RuntimeProgramHost } from "../host/program-host"
