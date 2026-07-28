import { Icons } from "@/components/icons"
import type { PageConfig } from "../page-config"
import { statusField, defFields, sc } from "./_helpers"

export const billingConfigs: Record<string, PageConfig> = {
  invoices: {
    id: "invoices", title: "Invoices", description: "Customer invoices and billing records",
    apiEndpoint: "/api/invoices",
    serverSide: true, statusField,
    transform: (d: any) => (d.invoices || []).map((inv: any) => ({
      id: inv.id, customer: inv.customerName || inv.customer || inv.customerId || "—",
      amount: inv.amount || inv.total || 0, status: inv.status || "pending",
      dueDate: inv.dueDate || inv.dueAt || "", createdAt: inv.createdAt || "",
    })),
    columns: [
      { id: "customer", header: "Customer", accessor: r => r.customer, type: "avatar", width: 200 },
      { id: "amount", header: "Amount", accessor: r => `EGP ${(r.amount||0).toLocaleString()}`, type: "number", width: 140 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "dueDate", header: "Due Date", accessor: r => r.dueDate, type: "date", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "customer", label: "Customer", type: "text", required: true },
      { name: "amount", label: "Amount (EGP)", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: [ { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }, { value: "cancelled", label: "Cancelled" } ] },
      { name: "dueDate", label: "Due Date", type: "date" },
    ]),
    statsCards: [sc("Total", Icons.billing, r=>r.length), sc("Paid", Icons.circleCheck, r=>r.filter(x=>x.status==="paid"||x.status==="active").length), sc("Overdue", Icons.circleX, r=>r.filter(x=>x.status==="overdue").length), sc("Pending", Icons.clock, r=>r.filter(x=>x.status==="pending").length)],
  },
  payments: {
    id: "payments", title: "Payments", description: "Customer payment transactions",
    apiEndpoint: "/api/payments",
    serverSide: true, statusField,
    transform: (d: any) => (d.payments || []).map((p: any) => ({
      id: p.id, customer: p.customerName || p.customer || p.customerId || "—",
      amount: p.amount || p.total || 0, method: p.method || p.paymentMethod || "—",
      status: p.status || "completed", createdAt: p.createdAt || "",
    })),
    columns: [
      { id: "customer", header: "Customer", accessor: r => r.customer, type: "avatar", width: 200 },
      { id: "amount", header: "Amount", accessor: r => `EGP ${(r.amount||0).toLocaleString()}`, type: "number", width: 140 },
      { id: "method", header: "Method", accessor: r => r.method, type: "badge", width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Date", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "customer", label: "Customer", type: "text", required: true },
      { name: "amount", label: "Amount (EGP)", type: "number", required: true },
      { name: "method", label: "Payment Method", type: "select", options: [ { value: "credit_card", label: "Credit Card" }, { value: "bank_transfer", label: "Bank Transfer" }, { value: "cash", label: "Cash" }, { value: "wallet", label: "Digital Wallet" } ] },
    ]),
    statsCards: [sc("Total", Icons.billing, r=>r.length), sc("Completed", Icons.circleCheck, r=>r.filter(x=>x.status==="completed"||x.status==="active").length), sc("Failed", Icons.circleX, r=>r.filter(x=>x.status==="failed"||x.status==="terminated").length)],
  },
  statements: {
    id: "statements", title: "Customer Statements", description: "View customer statements and aging",
    apiEndpoint: "/api/payments/customers/:id/statement",
    serverSide: false, statusField,
    transform: (d: any) => {
      if (!d || !d.customerId) return [];
      return [{
        id: d.customerId, customer: d.customerName || d.customerId,
        totalInvoiced: d.totalInvoiced || 0, totalPaid: d.totalPaid || 0,
        balance: d.balance || 0, aging: d.aging ? JSON.stringify(d.aging).slice(0, 200) : "",
      }];
    },
    columns: [
      { id: "customer", header: "Customer", accessor: r => r.customer, type: "avatar", width: 220 },
      { id: "totalInvoiced", header: "Total Invoiced", accessor: r => `EGP ${(r.totalInvoiced||0).toLocaleString()}`, width: 140 },
      { id: "totalPaid", header: "Total Paid", accessor: r => `EGP ${(r.totalPaid||0).toLocaleString()}`, width: 140 },
      { id: "balance", header: "Balance", accessor: r => `EGP ${(r.balance||0).toLocaleString()}`, width: 140 },
      { id: "aging", header: "Aging", accessor: r => r.aging || "—", width: 200 },
    ],
    fields: defFields([{ name: "customerId", label: "Customer ID", type: "text", required: true, placeholder: "Enter customer UUID" }]),
    statsCards: [],
  },
}
