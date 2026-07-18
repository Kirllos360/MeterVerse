"use client"

import { useState, useEffect, useCallback } from "react"
import { DataEngine } from "../data-engine"
import type { Query, QueryResult, Entity } from "../contracts/types"
import type { Repository } from "../repositories/base-repository"

let globalEngine: DataEngine | null = null

export function createDataEngine(config?: { baseUrl?: string }): DataEngine {
  if (!globalEngine) globalEngine = new DataEngine(config)
  return globalEngine
}

export function getDataEngine(): DataEngine {
  if (!globalEngine) throw new Error("DataEngine not initialized. Call createDataEngine() first.")
  return globalEngine
}

export function useQuery<T extends Entity>(repository: Repository<T>, query: Query<T>, deps: unknown[] = []) {
  const [result, setResult] = useState<QueryResult<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await repository.query(query)
      setResult(res)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [repository, ...deps])

  useEffect(() => { execute() }, [execute])

  return { data: result?.data || [], total: result?.total || 0, loading, error, refresh: execute }
}

export function useGetById<T extends Entity>(repository: Repository<T>, id: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    repository.getById(id).then(setData).finally(() => setLoading(false))
  }, [repository, id])

  return { data, loading }
}

export function useCreate<T extends Entity>(repository: Repository<T>) {
  const [loading, setLoading] = useState(false)
  const create = useCallback(async (data: Partial<T>) => {
    setLoading(true)
    try { return await repository.create(data) } finally { setLoading(false) }
  }, [repository])
  return { create, loading }
}

export function useUpdate<T extends Entity>(repository: Repository<T>) {
  const [loading, setLoading] = useState(false)
  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true)
    try { return await repository.update(id, data) } finally { setLoading(false) }
  }, [repository])
  return { update, loading }
}

export function useDelete<T extends Entity>(repository: Repository<T>) {
  const [loading, setLoading] = useState(false)
  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try { await repository.delete(id) } finally { setLoading(false) }
  }, [repository])
  return { remove, loading }
}
