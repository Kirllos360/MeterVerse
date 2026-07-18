/* ── Query Framework — Core Client + React Hooks ── */

import { useEffect, useRef, useState, useCallback } from "react";
import { queryCache, CacheManager } from "./cache";
import { defaultRetry, RetryManager } from "./retry";

/* ── Types ── */
export type QueryStatus = "idle" | "loading" | "success" | "error" | "refreshing" | "stale" | "offline" | "retrying" | "cancelled";
export type MutationStatus = "idle" | "loading" | "success" | "error";

export interface QueryState<T> {
  data: T | null;
  error: Error | null;
  status: QueryStatus;
  isFetching: boolean;
  isStale: boolean;
  lastUpdated: number | null;
}

export interface MutationState<T> {
  data: T | null;
  error: Error | null;
  status: MutationStatus;
  reset: () => void;
}

export interface QueryConfig {
  staleMs?: number;
  freshMs?: number;
  retry?: boolean | number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (err: Error) => void;
}

/* ── In-flight deduplication ── */
const inflight = new Map<string, Promise<any>>();

/* ── Query Client ── */
class QueryClient {
  private cache: CacheManager;
  private retry: RetryManager;
  private subscribers = new Map<string, Set<() => void>>();

  constructor(cache?: CacheManager, retry?: RetryManager) {
    this.cache = cache || queryCache;
    this.retry = retry || defaultRetry;
    this.cache.onInvalidate((key) => {
      const subs = this.subscribers.get(key);
      if (subs) subs.forEach((fn) => fn());
    });
  }

  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: QueryConfig,
  ): Promise<{ data: T; fromCache: boolean }> {
    /* Check cache */
    const cached = this.cache.get<T>(key);
    if (cached && cached.status === "fresh") return { data: cached.data, fromCache: true };

    /* Deduplicate */
    if (inflight.has(key)) return { data: await inflight.get(key)!, fromCache: false };

    /* Fetch */
    const promise = this.executeFetch(key, fetcher, config);
    inflight.set(key, promise);
    try { return { data: await promise, fromCache: false }; }
    finally { inflight.delete(key); }
  }

  private async executeFetch<T>(key: string, fetcher: () => Promise<T>, config?: QueryConfig): Promise<T> {
    const maxRetries = typeof config?.retry === "number" ? config.retry : config?.retry !== false ? 2 : 0;
    let lastErr: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const data = await fetcher();
        this.cache.set(key, data, config?.freshMs, config?.staleMs);
        this.notifySubscribers(key);
        config?.onSuccess?.(data);
        return data;
      } catch (err: any) {
        lastErr = err;
        if (i < maxRetries && (err?.status >= 500 || err?.status === 429 || !err?.status)) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
          continue;
        }
        config?.onError?.(err);
        throw err;
      }
    }
    throw lastErr;
  }

  invalidate(key: string) { this.cache.invalidate(key); this.notifySubscribers(key); }
  invalidateAll() { this.cache.invalidateAll(); this.subscribers.forEach((_, k) => this.notifySubscribers(k)); }

  subscribe(key: string, fn: () => void): () => void {
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(fn);
    return () => { this.subscribers.get(key)?.delete(fn); };
  }

  private notifySubscribers(key: string) {
    this.subscribers.get(key)?.forEach((fn) => fn());
  }

  getCache() { return this.cache; }
}

export const queryClient = new QueryClient();

/* ── React Hook: useQuery ── */
export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: QueryConfig,
): QueryState<T> & { refetch: () => Promise<void> } {
  const enabled = config?.enabled !== false;
  const [state, setState] = useState<QueryState<T>>({
    data: null, error: null, status: "idle", isFetching: false, isStale: false, lastUpdated: null,
  });
  const mounted = useRef(true);
  const keyRef = useRef(key);
  keyRef.current = key;

  const execute = useCallback(async () => {
    const cached = queryCache.get<T>(keyRef.current);
    setState((s) => ({ ...s, status: cached ? "refreshing" : "loading", isFetching: true }));
    try {
      const { data } = await queryClient.fetch(keyRef.current, fetcher, config);
      if (mounted.current) setState({ data, error: null, status: "success", isFetching: false, isStale: false, lastUpdated: Date.now() });
    } catch (err: any) {
      if (mounted.current) setState((s) => ({ ...s, error: err, status: "error", isFetching: false }));
    }
  }, [fetcher, config]);

  useEffect(() => {
    mounted.current = true;
    if (enabled) execute();
    const unsub = queryClient.subscribe(key, () => {
      const cached = queryCache.get<T>(key);
      if (cached) setState((s) => ({ ...s, data: cached.data, isStale: cached.status === "stale" }));
    });
    return () => { mounted.current = false; unsub(); };
  }, [key, enabled]);

  return { ...state, refetch: execute };
}

/* ── React Hook: useMutation ── */
export function useMutation<T, V = void>(
  mutationFn: (vars: V) => Promise<T>,
  config?: { onSuccess?: (data: T) => void; onError?: (err: Error) => void },
): MutationState<T> & { mutate: (vars: V) => Promise<T> } {
  const [state, setState] = useState<MutationState<T>>({
    data: null, error: null, status: "idle", reset: () => setState({ data: null, error: null, status: "idle", reset: () => {} }),
  });

  const mutate = useCallback(async (vars: V): Promise<T> => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const data = await mutationFn(vars);
      setState({ data, error: null, status: "success", reset: state.reset });
      config?.onSuccess?.(data);
      return data;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err, status: "error" }));
      config?.onError?.(err);
      throw err;
    }
  }, [mutationFn, config?.onSuccess, config?.onError]);

  return { ...state, mutate };
}
