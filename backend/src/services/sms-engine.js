import { prisma } from "../db.js"

export async function sendSms(to, message) {
  try {
    // Placeholder: replace with Twilio/Vonage integration
    await prisma.smsLog.create({ data: { to, from: "MeterVerse", message, status: "sent", sentAt: new Date() } })
    return { success: true }
  } catch (err) {
    await prisma.smsLog.create({ data: { to, from: "MeterVerse", message, status: "failed", error: err.message } })
    return { success: false, error: err.message }
  }
}
