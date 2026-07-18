import { create } from "zustand";
import { api } from "@/v2/lib/api/client";

/* ── Types ── */
export interface Customer {
  id: string; name: string; code: string; phone: string; email: string;
  type: string; status: string; balance: number; meters: number;
}

export interface Meter {
  id: string; code: string; customerId: string; customerName: string;
  type: string; status: string; consumption: string; lastReading: string;
  latitude?: number; longitude?: number;
}

export interface Reading {
  id: string; meterId: string; meterCode: string; customerName: string;
  value: number; unit: string; date: string; status: string; source: string;
}

export interface Invoice {
  id: string; number: string; customerId: string; customerName: string;
  amount: number; dueDate: string; status: string; items: number;
  lineItems?: { description: string; quantity: number; rate: number; total: number }[];
}

export interface Payment {
  id: string; ref: string; invoiceId: string; invoiceNumber: string;
  customerName: string; amount: number; date: string; method: string; status: string;
}

/* ── Customer Store ── */
interface CustomerStore {
  customers: Customer[]; selected: Customer | null; loading: boolean;
  fetchAll: () => Promise<void>; fetchById: (id: string) => Promise<void>;
  setSelected: (c: Customer | null) => void;
}
export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [], selected: null, loading: false,
  fetchAll: async () => { set({ loading: true }); try { const res = await api.get<Customer[]>("/customers"); set({ customers: res.data, loading: false }); } catch { set({ loading: false }); } },
  fetchById: async (id) => { set({ loading: true }); try { const res = await api.get<Customer>(`/customers/${id}`); set({ selected: res.data, loading: false }); } catch { set({ loading: false }); } },
  setSelected: (c) => set({ selected: c }),
}));

/* ── Meter Store ── */
interface MeterStore {
  meters: Meter[]; selected: Meter | null; loading: boolean;
  fetchAll: () => Promise<void>; fetchById: (id: string) => Promise<void>;
}
export const useMeterStore = create<MeterStore>((set) => ({
  meters: [], selected: null, loading: false,
  fetchAll: async () => { set({ loading: true }); try { const res = await api.get<Meter[]>("/meters"); set({ meters: res.data, loading: false }); } catch { set({ loading: false }); } },
  fetchById: async (id) => { set({ loading: true }); try { const res = await api.get<Meter>(`/meters/${id}`); set({ selected: res.data, loading: false }); } catch { set({ loading: false }); } },
}));

/* ── Reading Store ── */
interface ReadingStore {
  readings: Reading[]; loading: boolean;
  fetchByMeter: (meterId: string) => Promise<void>;
  fetchAll: () => Promise<void>;
}
export const useReadingStore = create<ReadingStore>((set) => ({
  readings: [], loading: false,
  fetchAll: async () => { set({ loading: true }); try { const res = await api.get<Reading[]>("/readings"); set({ readings: res.data, loading: false }); } catch { set({ loading: false }); } },
  fetchByMeter: async (meterId) => { set({ loading: true }); try { const res = await api.get<Reading[]>(`/readings?meterId=${meterId}`); set({ readings: res.data, loading: false }); } catch { set({ loading: false }); } },
}));

/* ── Invoice Store ── */
interface InvoiceStore {
  invoices: Invoice[]; selected: Invoice | null; loading: boolean;
  fetchAll: () => Promise<void>; fetchById: (id: string) => Promise<void>;
}
export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [], selected: null, loading: false,
  fetchAll: async () => { set({ loading: true }); try { const res = await api.get<Invoice[]>("/invoices"); set({ invoices: res.data, loading: false }); } catch { set({ loading: false }); } },
  fetchById: async (id) => { set({ loading: true }); try { const res = await api.get<Invoice>(`/invoices/${id}`); set({ selected: res.data, loading: false }); } catch { set({ loading: false }); } },
}));

/* ── Payment Store ── */
interface PaymentStore {
  payments: Payment[]; loading: boolean;
  fetchAll: () => Promise<void>;
  fetchByInvoice: (invoiceId: string) => Promise<void>;
}
export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [], loading: false,
  fetchAll: async () => { set({ loading: true }); try { const res = await api.get<Payment[]>("/payments"); set({ payments: res.data, loading: false }); } catch { set({ loading: false }); } },
  fetchByInvoice: async (invoiceId) => { set({ loading: true }); try { const res = await api.get<Payment[]>(`/payments?invoiceId=${invoiceId}`); set({ payments: res.data, loading: false }); } catch { set({ loading: false }); } },
}));
