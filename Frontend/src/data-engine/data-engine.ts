import { CacheEngine } from "./cache/cache-engine"
import { OfflineEngine } from "./offline/offline-engine"
import { OptimisticEngine } from "./optimistic/optimistic-engine"
import { RestDataProvider } from "./providers/data-provider"
import { CustomerRepository, MeterRepository, InvoiceRepository, ReadingRepository, PaymentRepository } from "./repositories/concrete-repositories"

export interface DataEngineConfig {
  baseUrl?: string
}

export class DataEngine {
  readonly cache: CacheEngine
  readonly offline: OfflineEngine
  readonly optimistic: OptimisticEngine
  readonly provider: RestDataProvider

  readonly customers: CustomerRepository
  readonly meters: MeterRepository
  readonly invoices: InvoiceRepository
  readonly readings: ReadingRepository
  readonly payments: PaymentRepository

  constructor(config?: DataEngineConfig) {
    this.cache = new CacheEngine()
    this.provider = new RestDataProvider(config?.baseUrl)
    this.offline = new OfflineEngine(this.provider)
    this.optimistic = new OptimisticEngine()

    this.customers = new CustomerRepository(this.provider, this.cache, this.optimistic, "customers")
    this.meters = new MeterRepository(this.provider, this.cache, this.optimistic, "meters")
    this.invoices = new InvoiceRepository(this.provider, this.cache, this.optimistic, "invoices")
    this.readings = new ReadingRepository(this.provider, this.cache, this.optimistic, "readings")
    this.payments = new PaymentRepository(this.provider, this.cache, this.optimistic, "payments")
  }
}
