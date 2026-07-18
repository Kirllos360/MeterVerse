import { create } from "zustand";

export interface SearchResult {
  id: string;
  type: "customer" | "meter" | "invoice" | "payment" | "reading";
  label: string;
  subtitle: string;
}

interface SearchStore {
  open: boolean;
  query: string;
  results: SearchResult[];
  setOpen: (o: boolean) => void;
  setQuery: (q: string) => void;
  setResults: (r: SearchResult[]) => void;
  search: (q: string) => void;
}

const mockSearch = (q: string): SearchResult[] => {
  if (!q) return [];
  const lq = q.toLowerCase();
  const all: SearchResult[] = [
    { id: "c1", type: "customer", label: "Ahmed El-Sayed", subtitle: "CUST-001 · Residential" },
    { id: "c2", type: "customer", label: "Mohamed Ali", subtitle: "CUST-002 · Residential" },
    { id: "c3", type: "customer", label: "Sara Khaled", subtitle: "CUST-003 · Commercial" },
    { id: "c4", type: "customer", label: "Mahmoud Ibrahim", subtitle: "CUST-004 · Residential" },
    { id: "c5", type: "customer", label: "Nadia Youssef", subtitle: "CUST-005 · Company" },
    { id: "m1", type: "meter", label: "MTR-001", subtitle: "Ahmed El-Sayed · Residential" },
    { id: "m2", type: "meter", label: "MTR-002", subtitle: "Mohamed Ali · Residential" },
    { id: "m3", type: "meter", label: "MTR-003", subtitle: "Sara Khaled · Commercial" },
    { id: "m4", type: "meter", label: "MTR-004", subtitle: "Mahmoud Ibrahim · Residential" },
    { id: "m5", type: "meter", label: "MTR-005", subtitle: "Nadia Youssef · Industrial" },
    { id: "i1", type: "invoice", label: "INV-2026-001", subtitle: "Ahmed El-Sayed · EGP 1,245.50" },
    { id: "i2", type: "invoice", label: "INV-2026-002", subtitle: "Mohamed Ali · EGP 340.25" },
    { id: "i3", type: "invoice", label: "INV-2026-003", subtitle: "Sara Khaled · EGP 5,200.00" },
    { id: "p1", type: "payment", label: "PAY-001", subtitle: "INV-2026-002 · EGP 340.25" },
    { id: "r1", type: "reading", label: "MTR-001 · 450 kWh", subtitle: "2026-07-08 · Verified" },
  ];
  return all.filter((r) => r.label.toLowerCase().includes(lq) || r.subtitle.toLowerCase().includes(lq));
};

export const useSearch = create<SearchStore>((set) => ({
  open: false,
  query: "",
  results: [],
  setOpen: (o) => set({ open: o, query: "", results: [] }),
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  search: (q) => {
    set({ query: q });
    set({ results: mockSearch(q) });
  },
}));
