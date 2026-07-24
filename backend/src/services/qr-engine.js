import QRCode from "qrcode"
import crypto from "crypto"
import path from "path"
import fs from "fs"

const QR_DIR = process.env.QR_OUTPUT_DIR || "./qr-output"
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true })

export function generateInvoiceHash(invoice) {
  const data = `${invoice.id}|${invoice.number}|${invoice.amount}|${invoice.createdAt?.toISOString() || ""}|${invoice.customerId}`
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16)
}

export async function generateInvoiceQR(invoice) {
  const hash = generateInvoiceHash(invoice)
  const verificationUrl = `${process.env.BASE_URL || "http://localhost:7400"}/verify/invoice/${invoice.id}?hash=${hash}`
  const qrPath = path.join(QR_DIR, `qr-${invoice.id}.png`)
  await QRCode.toFile(qrPath, verificationUrl, { width: 200, margin: 2, color: { dark: "#000", light: "#fff" } })
  return { filepath: qrPath, hash, verificationUrl }
}

export function verifyInvoiceHash(invoice, providedHash) {
  const computed = generateInvoiceHash(invoice)
  return computed === providedHash
}
