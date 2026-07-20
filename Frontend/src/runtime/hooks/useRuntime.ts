"use client"

import { useState, useEffect } from "react"
import type { RuntimeContext } from "../contracts/runtime"
import type { ProgramContract } from "../contracts/program"
import type { FocusChangeEvent } from "../kernel/focus"
import type { SelectionChangeEvent } from "../kernel/selection"
import { getRuntime } from "../providers/runtime-provider"

export function useRuntime(): RuntimeContext {
  return getRuntime()
}

export function useProgram(programId?: string): ProgramContract | undefined {
  const runtime = useRuntime()
  const [program, setProgram] = useState<ProgramContract | undefined>(
    programId ? runtime.programs.get(programId) : runtime.programs.getActive()
  )

  useEffect(() => {
    const unsub = runtime.events.subscribe("runtime:program:stateChanged", ({ programId: pid }: { programId: string }) => {
      if (!programId || programId === pid) setProgram(runtime.programs.get(pid))
    })
    return unsub
  }, [runtime, programId])

  return program
}

export function useFocus() {
  const runtime = useRuntime()
  const [focusState, setFocusState] = useState<{ focusedProgramId: string | null }>({
    focusedProgramId: runtime.focus.focusedProgram?.id ?? null,
  })

  useEffect(() => {
    const unsub = runtime.events.subscribe("runtime:focus:changed", (event: FocusChangeEvent) => {
      setFocusState({ focusedProgramId: event.programId })
    })
    return unsub
  }, [runtime])

  return focusState
}

export function useSelection() {
  const runtime = useRuntime()
  const [selectionState, setSelectionState] = useState({ selection: runtime.selection.selection })

  useEffect(() => {
    const unsub = runtime.selection.onSelectionChange.subscribe((event: SelectionChangeEvent) => {
      setSelectionState({ selection: event.selection })
    })
    return unsub
  }, [runtime])

  return selectionState
}

export function useHistory() {
  const runtime = useRuntime()
  const [historyState, setHistoryState] = useState({ canGoBack: runtime.history.canGoBack, canGoForward: runtime.history.canGoForward })

  useEffect(() => {
    const unsub = runtime.history.onChange.subscribe(() => {
      setHistoryState({ canGoBack: runtime.history.canGoBack, canGoForward: runtime.history.canGoForward })
    })
    return unsub
  }, [runtime])

  return historyState
}
