/* ── Entity Query Hooks ── */

import { useQuery, useMutation, queryClient } from "./client";
import { customerRepo, meterRepo, invoiceRepo, paymentRepo } from "@/v2/repositories";
import type { Customer, Meter, Invoice, Payment, CustomerInvoice, CustomerPayment, CustomerMeter, Alert, Case, Communication, Audit, PaymentPlan } from "@/v2/data/fixtures/models";

/* ── Customer Hooks ── */
export function useCustomers() {
  return useQuery("customers", () => customerRepo.find());
}

export function useCustomer(id: string) {
  return useQuery(`customer:${id}`, () => customerRepo.findById(id).then((c) => c!), { enabled: !!id });
}

export function useCustomerInvoices(customerId: string) {
  return useQuery(`customer:${customerId}:invoices`, () => Promise.resolve(customerRepo.getInvoices(customerId)), { enabled: !!customerId });
}

export function useCustomerPayments(customerId: string) {
  return useQuery(`customer:${customerId}:payments`, () => Promise.resolve(customerRepo.getPayments(customerId)), { enabled: !!customerId });
}

export function useCustomerMeters(customerId: string) {
  return useQuery(`customer:${customerId}:meters`, () => Promise.resolve(customerRepo.getMeters(customerId)), { enabled: !!customerId });
}

export function useCustomerAlerts(customerId: string) {
  return useQuery(`customer:${customerId}:alerts`, () => Promise.resolve(customerRepo.getAlerts(customerId)), { enabled: !!customerId });
}

export function useCustomerAudits(customerId: string) {
  return useQuery(`customer:${customerId}:audits`, () => Promise.resolve(customerRepo.getAudits(customerId)), { enabled: !!customerId });
}

export function useCreateCustomer() {
  return useMutation((data: Partial<Customer>) => customerRepo.create(data).then((r) => { queryClient.invalidate("customers"); return r; }));
}

/* ── Meter Hooks ── */
export function useMeters() {
  return useQuery("meters", () => meterRepo.find());
}

export function useMeter(id: string) {
  return useQuery(`meter:${id}`, () => meterRepo.findById(id).then((m) => m!), { enabled: !!id });
}

export function useMeterReadings(meterId: string) {
  return useQuery(`meter:${meterId}:readings`, () => Promise.resolve(meterRepo.getReadings(meterId)), { enabled: !!meterId });
}

export function useMeterAlarms(meterId: string) {
  return useQuery(`meter:${meterId}:alarms`, () => Promise.resolve(meterRepo.getAlarms(meterId)), { enabled: !!meterId });
}

/* ── Invoice Hooks ── */
export function useInvoices() {
  return useQuery("invoices", () => invoiceRepo.find());
}

export function useInvoice(id: string) {
  return useQuery(`invoice:${id}`, () => invoiceRepo.findById(id).then((i) => i!), { enabled: !!id });
}

/* ── Payment Hooks ── */
export function usePayments() {
  return useQuery("payments", () => paymentRepo.find());
}

/* ── Cache Helpers ── */
export function invalidateCustomers() { queryClient.invalidate("customers"); }
export function invalidateCustomer(id: string) { queryClient.invalidate(`customer:${id}`); }
export function invalidateMeters() { queryClient.invalidate("meters"); }
export function invalidateMeter(id: string) { queryClient.invalidate(`meter:${id}`); }
export function invalidateAll() { queryClient.invalidateAll(); }
