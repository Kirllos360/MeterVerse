import { create } from "zustand"

export type InvoiceStatus = "draft" | "issued" | "outstanding" | "overdue" | "paid" | "voided" | "credited"

export const invoiceRuntime = {
  statuses: ["draft", "issued", "outstanding", "overdue", "paid", "voided", "credited"] as InvoiceStatus[],

  workflow: {
    draft: ["issued"],
    issued: ["outstanding", "overdue", "voided"],
    outstanding: ["paid", "overdue", "voided"],
    overdue: ["paid", "voided"],
    paid: ["credited"],
    voided: [],
    credited: [],
  } as Record<InvoiceStatus, InvoiceStatus[]>,

  createDefault: () => ({ status: "draft" as InvoiceStatus }),
}

export const useInvoiceRuntime = create(() => ({
  statuses: invoiceRuntime.statuses,
  workflow: invoiceRuntime.workflow,
}))
