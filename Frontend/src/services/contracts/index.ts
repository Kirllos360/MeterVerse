import type { ApiResponse, ApiError } from "../api-client"

export type { ApiResponse, ApiError }

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
  [key: string]: unknown
}
