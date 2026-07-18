export interface Entity {
  id: string
  [key: string]: unknown
}

export interface Query<T> {
  from: string
  where?: WhereClause[]
  orderBy?: SortClause[]
  pagination?: PaginationClause
  select?: string[]
}

export interface WhereClause {
  field: string
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "startsWith" | "endsWith" | "between" | "fuzzy"
  value: unknown
}

export interface SortClause {
  field: string
  direction: "asc" | "desc"
}

export interface PaginationClause {
  page: number
  pageSize: number
}

export interface QueryResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  duration: number
}

export type MutationType = "create" | "update" | "delete" | "upsert"

export interface Mutation<T = unknown> {
  type: MutationType
  entityType: string
  id?: string
  data?: Partial<T>
  queryKeys?: string[]
}

export interface MutationResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface TransactionResult<T> {
  success: boolean
  data?: T
  error?: string
  results: MutationResult<unknown>[]
  rolledBack: boolean
}
