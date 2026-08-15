import { prisma } from "../db.js"

// ─── CHEQUE ENGINE (P59-C/LR-7 · §10) ───────────────────────────────────────
// Evidence-supported adaptation of the legacy Cheque lifecycle
// (PENDING -> cleared_date set -> cleared) onto MeterVerse's existing Payment
// model (method="cheque", reference=cheque number, notes=bank). No schema change.
//
// MeterVerse Payment has: method (incl. "cheque"), status, reference, notes,
// paidAt. We map:
//   legacy cheque_number  -> Payment.reference
//   legacy bank_name      -> Payment.notes (prefixed "bank: ")
//   legacy status PENDING -> Payment.status "pending"
//   legacy cleared_date   -> Payment.paidAt (set on clear)
//   legacy notes          -> Payment.notes

const CHEQUE_METHOD = "cheque"

// Create a cheque payment (status=pending until cleared).
export async function createChequePayment({ customerId, invoiceId, amount, chequeNumber, bankName, notes }) {
  if (!chequeNumber) throw new Error("chequeNumber is required for cheque payments")
  const payment = await prisma.payment.create({
    data: {
      customerId,
      invoiceId: invoiceId || null,
      amount,
      method: CHEQUE_METHOD,
      status: "pending",
      reference: chequeNumber,
      notes: [bankName ? `bank: ${bankName}` : null, notes || null].filter(Boolean).join(" | ") || null,
      paidAt: null,
    },
  })
  return payment
}

// Clear a cheque payment (legacy cleared_date -> paidAt, status -> completed).
export async function clearChequePayment(paymentId) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new Error("Payment not found")
  if (payment.method !== CHEQUE_METHOD) throw new Error(`Payment ${paymentId} is not a cheque`)
  if (payment.status === "completed") return payment // idempotent
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "completed", paidAt: new Date() },
  })
  return updated
}

// Reject/bounce a cheque (legacy rejection -> status rejected).
export async function rejectChequePayment(paymentId, reason) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new Error("Payment not found")
  if (payment.method !== CHEQUE_METHOD) throw new Error(`Payment ${paymentId} is not a cheque`)
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "rejected",
      notes: [payment.notes, `rejected: ${reason || "bounced"}`].filter(Boolean).join(" | ") || "rejected",
    },
  })
  return updated
}
