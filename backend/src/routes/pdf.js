import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { generateInvoicePdf, generateStatementPdf } from "../services/pdf-engine.js"
import path from "path"

const router = Router()
router.use(authenticate)

router.post("/invoices/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { customer: true } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found", code: "NOT_FOUND" })
    const result = await generateInvoicePdf(invoice, invoice.customer)
    auditLog(req, "pdf.invoice.generated", { invoiceId: invoice.id })
    res.json({ message: "PDF generated", file: result.filename, path: result.filepath })
  } catch (err) { next(err) }
})

router.post("/statements/:customerId", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found", code: "NOT_FOUND" })
    const invoices = await prisma.invoice.findMany({ where: { customerId: req.params.customerId }, orderBy: { createdAt: "desc" }, take: 50 })
    const payments = await prisma.payment.findMany({ where: { customerId: req.params.customerId, status: "completed" }, orderBy: { createdAt: "desc" }, take: 50 })
    const balance = invoices.reduce((s, i) => s + i.amount, 0) - payments.reduce((s, p) => s + p.amount, 0)
    const result = await generateStatementPdf(customer, invoices, payments, balance)
    auditLog(req, "pdf.statement.generated", { customerId: req.params.customerId })
    res.json({ message: "Statement PDF generated", file: result.filename, path: result.filepath })
  } catch (err) { next(err) }
})

export { router as pdfRouter }
