// Enterprise Data Engine — Phase 17E Implementation
// No component performs REST calls. Everything goes through repositories.

export { DataEngine } from "./data-engine"
export { Repository } from "./repositories/base-repository"
export { CustomerRepository, MeterRepository, InvoiceRepository, ReadingRepository, PaymentRepository } from "./repositories/concrete-repositories"
export { CacheEngine } from "./cache/cache-engine"
export { OfflineEngine } from "./offline/offline-engine"
export { OptimisticEngine } from "./optimistic/optimistic-engine"
export { RestDataProvider, MockDataProvider } from "./providers/data-provider"
export { createDataEngine, getDataEngine, useQuery, useGetById, useCreate, useUpdate, useDelete } from "./hooks/useDataEngine"

export type { DataProvider } from "./providers/data-provider"
export type { CacheOptions, CacheInvalidateEvent } from "./cache/cache-engine"
export type { PendingMutation, SyncResult } from "./offline/offline-engine"
export type { OptimisticUpdate, OptimisticConfig } from "./optimistic/optimistic-engine"
export type { Customer, Meter, Invoice, Reading, Payment } from "./repositories/concrete-repositories"
export type { Entity, Query, QueryResult, Mutation, MutationResult, WhereClause, SortClause, PaginationClause } from "./contracts/types"
