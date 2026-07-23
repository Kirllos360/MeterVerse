import { sendEmail } from "./email-engine.js"
import { prisma } from "../db.js"
// Rate limiting: prevents event spam (60s cooldown per event+recipient)
const COOLDOWN_SECONDS = 60;
const lastSent = new Map();

function isRateLimited(action, recipientId) {
  const key = action + ":" + (recipientId || "global");
  const last = lastSent.get(key);
  if (last && Date.now() - last < COOLDOWN_SECONDS * 1000) return true;
  lastSent.set(key, Date.now());
  return false;
}


const EVENT_CHANNEL_MAP = {
  "invoice.generated":      ["in_app", "email"],
  "invoice.created":        ["in_app"],
  "invoice.updated":        ["in_app"],
  "invoice.archived":       ["in_app"],
  "payment.created":        ["in_app", "email"],
  "payment.deleted":        ["in_app"],
  "customer.created":       ["in_app"],
  "customer.updated":       ["in_app"],
  "customer.archived":      ["in_app"],
  "meter.created":          ["in_app"],
  "meter.updated":          ["in_app"],
  "meter.archived":         ["in_app"],
  "reading.created":        ["in_app"],
  "reading.anomaly":        ["in_app", "email"],
  "readings.bulk_created":  ["in_app"],
  "assignment.created":     ["in_app"],
  "assignment.ended":       ["in_app"],
  "auth.login_failed":      ["in_app"],
  "auth.login_success":     ["in_app"],
  "customer.export":        ["in_app"],
  "contract.expiring":      ["in_app", "email"],
}

function renderTemplate(template, variables) {
  let body = template.body
  let subject = template.subject || ""
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, "g")
    body = body.replace(regex, String(value ?? ""))
    if (subject) subject = subject.replace(regex, String(value ?? ""))
  }
  return { body, subject }
}

export async function processEvent(action, variables = {}, metadata = {}) {
  const recipientId = variables.recipientId || metadata.actorId || null;
  if (isRateLimited(action, recipientId)) {
    return { action, skipped: true, reason: "Rate limited (cooldown " + COOLDOWN_SECONDS + "s)" };
  }
  const channels = EVENT_CHANNEL_MAP[action]
  if (!channels) return { action, skipped: true, reason: "No channels mapped" }

  const template = await prisma.notificationTemplate.findUnique({ where: { key: action } })
  if (!template) return { action, skipped: true, reason: "No template found" }

  const recipientEmail = variables.recipientEmail || null
  const rendered = renderTemplate(template, variables)
  const results = []

  for (const channel of channels) {
    if (channel === "in_app" && recipientId) {
      const notif = await prisma.notification.create({
        data: {
          type: "in_app",
          title: rendered.subject || template.name,
          body: rendered.body,
          recipientId,
          channel: "in_app",
          status: "sent",
          sentAt: new Date(),
        },
      })
      results.push({ channel: "in_app", id: notif.id, status: "sent" })
    }

    if (channel === "email" && (recipientEmail || recipientId)) {
      const email = await prisma.emailLog.create({
        data: {
          to: recipientEmail || `${recipientId}@meterverse.local`,
          from: "noreply@meterverse.com",
          subject: rendered.subject || template.name,
          body: rendered.body,
          status: "sent",
          sentAt: new Date(),
        },
      })
      results.push({ channel: "email", id: email.id, status: "sent" })
    }
  }

  return { action, template: template.key, channels, results }
}


