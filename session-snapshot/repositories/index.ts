/* ── Repository Factory & Registry ── */

import { BaseRepository } from "./base";
import type { Customer, Meter, Invoice, Payment, Reading, Alert, DashboardData, CustomerInvoice, CustomerPayment, CustomerMeter, PaymentPlan, Case, Communication, Audit, WorkOrder, Command, Maintenance } from "@/v2/data/fixtures/models";
import { mockCustomers, mockMeters, mockDashboardData, mockCustomerInvoices, mockCustomerPayments, mockCustomerMeters, mockPaymentPlans, mockAlerts, mockCases, mockCommunications, mockAudits, mockMeterReadings, mockMeterAlarms, mockMeterCommands, mockMeterComms, mockMeterWorkOrders, mockMeterMaintenance, mockMeterAudits } from "@/v2/data/mock";
import { ensureArray } from "@/v2/validators";

/* ── Customer Repository ── */
export class CustomerRepository extends BaseRepository<Customer> {
  protected basePath = "/customers";
  protected entityType = "customer";

  private useMock = true;

  async find(): Promise<Customer[]> { if (this.useMock) return mockCustomers; return super.find(); }
  async findById(id: string): Promise<Customer | null> { if (this.useMock) return mockCustomers.find((c) => c.id === id) ?? null; return super.findById(id); }
  async search(query: string): Promise<Customer[]> { if (this.useMock) { const q = query.toLowerCase(); return mockCustomers.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)); } return super.search(query); }
  async count(): Promise<number> { return mockCustomers.length; }
  async exists(id: string): Promise<boolean> { return mockCustomers.some((c) => c.id === id); }
  getAll(): Customer[] { return mockCustomers; }
  searchSync(query: string): Customer[] { const q = query.toLowerCase(); return mockCustomers.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)); }
  getById(id: string): Customer | null { return mockCustomers.find((c) => c.id === id) ?? null; }

  getInvoices(customerId: string): CustomerInvoice[] { return ensureArray<CustomerInvoice>(mockCustomerInvoices[customerId]); }
  getPayments(customerId: string): CustomerPayment[] { return ensureArray<CustomerPayment>(mockCustomerPayments[customerId]); }
  getMeters(customerId: string): CustomerMeter[] { return ensureArray<CustomerMeter>(mockCustomerMeters[customerId]); }
  getPaymentPlan(customerId: string): PaymentPlan | null { return mockPaymentPlans[customerId] ?? null; }
  getAlerts(customerId: string): Alert[] { return ensureArray<Alert>(mockAlerts[customerId]); }
  getCases(customerId: string): Case[] { return ensureArray<Case>(mockCases[customerId]); }
  getCommunications(customerId: string): Communication[] { return ensureArray<Communication>(mockCommunications[customerId]); }
  getAudits(customerId: string): Audit[] { return ensureArray<Audit>(mockAudits[customerId]); }
}

/* ── Meter Repository ── */
export class MeterRepository extends BaseRepository<Meter> {
  protected basePath = "/meters";
  protected entityType = "meter";
  private useMock = true;

  async find(): Promise<Meter[]> { if (this.useMock) return mockMeters; return super.find(); }
  async findById(id: string): Promise<Meter | null> { if (this.useMock) return mockMeters.find((m) => m.id === id) ?? null; return super.findById(id); }
  async search(query: string): Promise<Meter[]> { if (this.useMock) { const q = query.toLowerCase(); return mockMeters.filter((m) => m.code.toLowerCase().includes(q) || m.customer.toLowerCase().includes(q)); } return super.search(query); }
  async count(): Promise<number> { return mockMeters.length; }
  async exists(id: string): Promise<boolean> { return mockMeters.some((m) => m.id === id); }
  getAll(): Meter[] { return mockMeters; }
  searchSync(query: string): Meter[] { const q = query.toLowerCase(); return mockMeters.filter((m) => m.code.toLowerCase().includes(q) || m.customer.toLowerCase().includes(q)); }
  getById(id: string): Meter | null { return mockMeters.find((m) => m.id === id) ?? null; }

  getReadings(meterId: string): any[] { return ensureArray<any>(mockMeterReadings[meterId]); }
  getAlarms(meterId: string): any[] { return ensureArray<any>(mockMeterAlarms[meterId]); }
  getCommands(meterId: string): Command[] { return ensureArray<Command>(mockMeterCommands[meterId]); }
  getCommunications(meterId: string): any[] { return ensureArray<any>(mockMeterComms[meterId]); }
  getWorkOrders(meterId: string): WorkOrder[] { return ensureArray<WorkOrder>(mockMeterWorkOrders[meterId]); }
  getMaintenance(meterId: string): Maintenance[] { return ensureArray<Maintenance>(mockMeterMaintenance[meterId]); }
  getAudits(meterId: string): Audit[] { return ensureArray<Audit>(mockMeterAudits[meterId]); }
}

/* ── Dashboard Repository ── */
export class DashboardRepository {
  getData(): DashboardData { return mockDashboardData; }
}

/* ── Invoice Repository ── */
export class InvoiceRepository extends BaseRepository<Invoice> {
  protected basePath = "/invoices";
  protected entityType = "invoice";
  private useMock = true;
  async find(): Promise<Invoice[]> { if (this.useMock) return []; return super.find(); }
  async count(): Promise<number> { return 0; }
  async exists(): Promise<boolean> { return false; }
}

/* ── Payment Repository ── */
export class PaymentRepository extends BaseRepository<Payment> {
  protected basePath = "/payments";
  protected entityType = "payment";
  private useMock = true;
  async find(): Promise<Payment[]> { if (this.useMock) return []; return super.find(); }
  async count(): Promise<number> { return 0; }
  async exists(): Promise<boolean> { return false; }
}

/* ── Reading Repository ── */
export class ReadingRepository extends BaseRepository<Reading> {
  protected basePath = "/readings";
  protected entityType = "reading";
  private useMock = true;
  async find(): Promise<Reading[]> { if (this.useMock) return []; return super.find(); }
  async count(): Promise<number> { return 0; }
  async exists(): Promise<boolean> { return false; }
}

/* ── Repository Registry ── */
export class RepositoryRegistry {
  private repos = new Map<string, BaseRepository<any>>();

  register<T extends { id: string }>(name: string, repo: BaseRepository<T>): void { this.repos.set(name, repo); }
  get<T extends { id: string }>(name: string): BaseRepository<T> | undefined { return this.repos.get(name); }
  getAll(): Map<string, BaseRepository<any>> { return this.repos; }
}

/* ── Repository Factory ── */
export class RepositoryFactory {
  static createRegistry(): RepositoryRegistry {
    const registry = new RepositoryRegistry();
    registry.register("customer", new CustomerRepository());
    registry.register("meter", new MeterRepository());
    registry.register("invoice", new InvoiceRepository());
    registry.register("payment", new PaymentRepository());
    registry.register("reading", new ReadingRepository());
    return registry;
  }
}

/* ── Singleton exports ── */
export const customerRepo = new CustomerRepository();
export const meterRepo = new MeterRepository();
export const invoiceRepo = new InvoiceRepository();
export const paymentRepo = new PaymentRepository();
export const readingRepo = new ReadingRepository();
export const dashboardRepo = new DashboardRepository();
export const registry = RepositoryFactory.createRegistry();
