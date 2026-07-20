import { useRef, useState, useEffect, useCallback, type DependencyList } from "react"

/** Debounce a value change — use for search inputs, filter changes */
export function useDebounce<T>(value: T, delay: number): T {
  const ref = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    ref.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(ref.current)
  }, [value, delay])

  return debounced
}

/** Throttle a callback — use for scroll handlers, resize events */
export function useThrottle<T extends (...args: unknown[]) => void>(fn: T, limit: number): T {
  const inThrottle = useRef(false)
  return useCallback((...args: unknown[]) => {
    if (!inThrottle.current) {
      fn(...args)
      inThrottle.current = true
      setTimeout(() => { inThrottle.current = false }, limit)
    }
  }, [fn, limit]) as unknown as T
}

/** Memoize a value with deep equality comparison */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>(undefined)
  if (!ref.current || !depsAreEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }
  return ref.current.value
}

function depsAreEqual(a: DependencyList, b: DependencyList): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false
  }
  return true
}

/** Track render count (dev only) */
export function useRenderCount(name: string): void {
  const count = useRef(0)
  count.current++
  useEffect(() => { return () => { if (count.current > 10) console.warn(`[Render] ${name} rendered ${count.current} times`) } }, [])
}

/** Prevent unnecessary re-renders with stable reference */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback((...args: unknown[]) => ref.current(...args), []) as unknown as T
}


