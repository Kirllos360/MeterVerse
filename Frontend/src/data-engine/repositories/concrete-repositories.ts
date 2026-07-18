import { Repository } from "./base-repository"
import type { Entity, Query, QueryResult } from "../contracts/types"

export interface Customer extends Entity { code: string; name: string; nameAr?: string; phone: string; email: string; status: string }
export interface Meter extends Entity { serialNumber: string; meterType: string; brand: string; status: string; location?: string }
export interface Invoice extends Entity { invoiceNumber: string; amount: number; status: string; date: string }
export interface Reading extends Entity { meterId: string; meterSerial: string; readingValue: number; readingDate: string; status: string }
export interface Payment extends Entity { paymentNumber: string; amount: number; method: string; date: string; status: string }

export class CustomerRepository extends Repository<Customer> {
  async findByCode(code: string): Promise<Customer | null> {
    const result = await this.query({ from: "customers", where: [{ field: "code", operator: "eq", value: code }] })
    return result.data[0] || null
  }

  async search(queryStr: string): Promise<Customer[]> {
    const result = await this.query({ from: "customers", where: [{ field: "name", operator: "fuzzy", value: queryStr }], pagination: { page: 1, pageSize: 25 } })
    return result.data
  }
}

export class MeterRepository extends Repository<Meter> {
  async findBySerial(serial: string): Promise<Meter | null> {
    const r = await this.query({ from: "meters", where: [{ field: "serialNumber", operator: "eq", value: serial }] })
    return r.data[0] || null
  }

  async findByCustomer(_customerId: string): Promise<Meter[]> {
    const r = await this.query({ from: "meters", pagination: { page: 1, pageSize: 100 } })
    return r.data
  }

  async getReadings(meterId: string, _query: Query<Reading>): Promise<QueryResult<Reading>> {
    return { data: [], total: 0, page: 1, pageSize: 25, totalPages: 0, hasNext: false, hasPrevious: false, duration: 0 }
  }
}

export class InvoiceRepository extends Repository<Invoice> {
  async findByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const r = await this.query({ from: "invoices", where: [{ field: "invoiceNumber", operator: "eq", value: invoiceNumber }] })
    return r.data[0] || null
  }

  async findOverdue(): Promise<Invoice[]> {
    const r = await this.query({ from: "invoices", where: [{ field: "status", operator: "eq", value: "sent" }] })
    return r.data
  }
}

export class ReadingRepository extends Repository<Reading> {
  async findByMeter(meterId: string, page = 1, pageSize = 25): Promise<QueryResult<Reading>> {
    return this.query({ from: "readings", where: [{ field: "meterId", operator: "eq", value: meterId }], pagination: { page, pageSize }, orderBy: [{ field: "readingDate", direction: "desc" }] })
  }
}

export class PaymentRepository extends Repository<Payment> {
  async findByInvoice(invoiceId: string): Promise<Payment[]> {
    const r = await this.query({ from: "payments", where: [{ field: "id", operator: "eq", value: invoiceId }] })
    return r.data
  }
}
