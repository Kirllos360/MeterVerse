import { apiClient, type ApiRequest } from "../client/ApiClient"
import type { ApiError } from "../client/ApiClient"

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryParams {
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
  filters?: Record<string, unknown>
  [key: string]: unknown
}

export class BaseRepository<T, TID = string> {
  protected endpoint: string
  protected area?: string
  protected project?: string

  constructor(endpoint: string, options?: { area?: string; project?: string }) {
    this.endpoint = endpoint
    this.area = options?.area
    this.project = options?.project
  }

  protected buildConfig(overrides?: Partial<ApiRequest>): Partial<ApiRequest> {
    return { area: this.area, project: this.project, ...overrides }
  }

  async findAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(this.endpoint, params as Record<string, string | number | boolean | undefined>, this.buildConfig())
    return response.data
  }

  async findOne(id: TID): Promise<T> {
    const response = await apiClient.get<T>(`${this.endpoint}/${id}`, undefined, this.buildConfig())
    return response.data
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<T>(this.endpoint, data, this.buildConfig({ idempotent: true }))
    return response.data
  }

  async update(id: TID, data: Partial<T>): Promise<T> {
    const response = await apiClient.patch<T>(`${this.endpoint}/${id}`, data, this.buildConfig({ idempotent: true }))
    return response.data
  }

  async delete(id: TID): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`, this.buildConfig({ idempotent: true }))
  }

  async count(params?: QueryParams): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`${this.endpoint}/count`, params as Record<string, string | number | boolean | undefined>, this.buildConfig())
    return response.data.count
  }
}
