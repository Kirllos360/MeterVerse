import { create } from "zustand"

export type CustomerStatus = "active" | "suspended" | "archived" | "terminated"
export type CustomerType = "residential" | "commercial" | "industrial"

export interface CustomerState {
  statuses: CustomerStatus[]
  types: CustomerType[]
  setStatuses: (s: CustomerStatus[]) => void
  setTypes: (t: CustomerType[]) => void
}

export const customerRuntime = {
  statuses: ["active", "suspended", "archived", "terminated"] as CustomerStatus[],
  types: ["residential", "commercial", "industrial"] as CustomerType[],

  createDefault: () => ({
    status: "active" as CustomerStatus,
    type: "residential" as CustomerType,
  }),
}

export const useCustomerRuntime = create<CustomerState>((set) => ({
  statuses: customerRuntime.statuses,
  types: customerRuntime.types,
  setStatuses: (statuses) => set({ statuses }),
  setTypes: (types) => set({ types }),
}))
