import nodemailer from "nodemailer"
import { prisma } from "../db.js"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: { user: process.env.SMTP_USER || "", pass: process.env.SMTP_PASS || "" },
})

export async function sendEmail(to, subject, body) {
  try {
    const info = await transporter.sendMail({ from: process.env.SMTP_FROM || "noreply@meterverse.com", to, subject, html: body })
    await prisma.emailLog.create({ data: { to, from: process.env.SMTP_FROM || "noreply@meterverse.com", subject, body, status: "sent", sentAt: new Date() } })
    return { success: true, messageId: info.messageId }
  } catch (err) {
    await prisma.emailLog.create({ data: { to, from: process.env.SMTP_FROM || "noreply@meterverse.com", subject, body, status: "failed", error: err.message } })
    return { success: false, error: err.message }
  }
}
