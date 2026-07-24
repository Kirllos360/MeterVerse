import { Router } from "express"
import { prisma } from "../server.js"
import { generateInvoiceQR, verifyInvoiceHash } from "../services/qr-engine.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()

router.post("/invoices/:id/qr", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found", code: "NOT_FOUND" })
    const result = await generateInvoiceQR(invoice)
    auditLog(req, "qr.invoice.generated", { invoiceId: invoice.id })
    res.json({ message: "QR code generated", ...result })
  } catch (err) { next(err) }
})

router.get("/verify/invoice/:id", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found", code: "NOT_FOUND" })
    const hash = req.query.hash
    const valid = hash ? verifyInvoiceHash(invoice, hash) : false
    res.json({ invoiceId: invoice.id, number: invoice.number, amount: invoice.amount, status: invoice.status, verified: valid })
  } catch (err) { next(err) }
})

export { router as qrRouter }
