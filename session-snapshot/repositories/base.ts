/* ── Base Repository — all repositories inherit from this ── */

import { ApiClient, api } from "@/v2/lib/api/client";
import { cache, RepositoryCache } from "./cache";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindParams {
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract basePath: string;
  protected abstract entityType: string;
  protected api: ApiClient;
  protected cache: RepositoryCache;

  constructor(apiClient?: ApiClient, cacheInstance?: RepositoryCache) {
    this.api = apiClient || api;
    this.cache = cacheInstance || cache;
  }

  /* ── Reads ── */
  async find(params?: FindParams): Promise<T[]> {
    const list = await this.api.get<T[]>(this.basePath, { params: params as Record<string, string> });
    return list.data;
  }

  async findById(id: string): Promise<T | null> {
    const cached = this.cache.get<T>(this.cache.entityKey(this.entityType, id));
    if (cached) return cached;
    try {
      const res = await this.api.get<T>(`${this.basePath}/${id}`);
      this.cache.set(this.cache.entityKey(this.entityType, id), res.data);
      return res.data;
    } catch { return null; }
  }

  async search(query: string): Promise<T[]> {
    const list = await this.api.get<T[]>(`${this.basePath}/search`, { params: { q: query } });
    return list.data;
  }

  async filter(filters: Record<string, string>): Promise<T[]> {
    const list = await this.api.get<T[]>(this.basePath, { params: filters });
    return list.data;
  }

  async paginate(params?: PaginationParams): Promise<PaginatedResult<T>> {
    const res = await this.api.get<PaginatedResult<T>>(`${this.basePath}/paginate`, { params: params as Record<string, string> });
    return res.data;
  }

  async count(): Promise<number> {
    const res = await this.api.get<{ count: number }>(`${this.basePath}/count`);
    return res.data.count;
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /* ── Writes ── */
  async create(data: Partial<T>): Promise<T> {
    const res = await this.api.post<T>(this.basePath, data);
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return res.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const res = await this.api.put<T>(`${this.basePath}/${id}`, data);
    this.cache.invalidate(this.cache.entityKey(this.entityType, id));
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return res.data;
  }

  async delete(id: string): Promise<boolean> {
    await this.api.delete(`${this.basePath}/${id}`);
    this.cache.invalidate(this.cache.entityKey(this.entityType, id));
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return true;
  }

  /* ── Bulk ── */
  async bulkCreate(items: Partial<T>[]): Promise<T[]> {
    const res = await this.api.post<T[]>(`${this.basePath}/bulk`, items);
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return res.data;
  }

  async bulkUpdate(ids: string[], data: Partial<T>): Promise<T[]> {
    const res = await this.api.put<T[]>(`${this.basePath}/bulk`, { ids, data });
    ids.forEach((id) => this.cache.invalidate(this.cache.entityKey(this.entityType, id)));
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return res.data;
  }

  async bulkDelete(ids: string[]): Promise<boolean> {
    await this.api.delete(`${this.basePath}/bulk`, { body: { ids } });
    ids.forEach((id) => this.cache.invalidate(this.cache.entityKey(this.entityType, id)));
    this.cache.invalidatePattern(new RegExp(this.entityType));
    return true;
  }
}
