// P12.2-D — Pilot ledger consumer (P12-03-02)
// Registers with the outbox dispatcher to consume financial events
// (INVOICE_ISSUED, PAYMENT_RECEIVED, ...) with idempotency + replay-guard.
import crypto from "crypto"
import { prisma } from "../db.js"
import { registerConsumer } from "./outbox-dispatcher.js"
import { postEvent } from "./posting-engine.js"
import logger from "./logger.js"

const CONSUMER_KEY = "ledger"
const ACTIVE = () => process.env.CONSUMER_LEDGER_OUTBOX === "true"
const SHADOW = () => process.env.CONSUMER_LEDGER_SHADOW === "true"

const SUPPORTED_TYPES = new Set(["INVOICE_ISSUED", "PAYMENT_RECEIVED", "INVOICE_CANCELLED", "PAYMENT_REVERSED", "INVOICE_ADJUSTED"])

function deriveIdempotencyKey(event) {
  return crypto.createHash("sha256")
    .update(`${event.areaId || "global"}:financial:${event.aggregateId}:${event.eventType}:${event.occurredAt?.toISOString?.() || ""}`)
    .digest("hex")
}

// financialReplayGuard: if a real GL/ledger write already happened for this
// event but no idempotency record exists, treat as DEAD (missing-idempotency).
async function financialReplayGuard(event, idempotencyKey, tx) {
  const existing = await tx.financialEvent.findUnique({
    where: { sourceType_sourceId: { sourceType: event.aggregateType, sourceId: event.aggregateId } },
  })
  if (existing && existing.status === "POSTED") {
    return { guard: false, reason: "missing-idempotency: GL already posted but no idempotency record" }
  }
  return { guard: true }
}

// The ledger consumer handler registered with the dispatcher.
export async function ledgerConsumer(event) {
  if (!SUPPORTED_TYPES.has(event.eventType)) return { ok: true } // not our type
  const idempotencyKey = deriveIdempotencyKey(event)
  const scope = "financial"

  // Idempotency lookup
  const existing = await prisma.idempotencyRecord.findUnique({
    where: { scope_areaId_operation_key: { scope, areaId: event.areaId || "global", operation: event.eventType, key: idempotencyKey } },
  })
  if (existing && existing.status === "COMPLETED") return { ok: true, skipped: true } // deduped
  if (existing && existing.status === "CONFLICT") return { ok: false, error: "idempotency conflict" }

  // Replay guard (financial safety)
  const guard = await financialReplayGuard(event, idempotencyKey, prisma)
  if (!guard.guard) return { ok: false, error: guard.reason }

  // Shadow mode: validate + log, no mutation
  if (SHADOW() && !ACTIVE()) {
    logger.info({ component: "consumer-ledger", eventId: event.id, correlationId: event.correlationId }, "SHADOW: would post " + event.eventType)
    return { ok: true, shadow: true }
  }

  // Active mode: post to GL idempotently + persist response
  if (ACTIVE()) {
    const payload = JSON.parse(event.payload || "{}")
    const result = await postEvent({
      sourceType: event.aggregateType,
      sourceId: event.aggregateId,
      eventType: event.eventType,
      amount: payload.amount,
      description: payload.description,
      context: { customerId: payload.context?.customerId, currency: "EGP", areaId: event.areaId, projectId: event.projectId },
    })
    if (!result.ok && result.skipped) return { ok: true, skipped: true }
    if (!result.ok) return { ok: false, error: result.error || "postEvent failed" }
    await prisma.idempotencyRecord.create({
      data: {
        key: idempotencyKey, scope, areaId: event.areaId || "global", operation: event.eventType,
        requestHash: crypto.createHash("sha256").update(JSON.stringify(event)).digest("hex"),
        status: "COMPLETED", responseBody: JSON.stringify(result), completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    })
    return { ok: true }
  }

  // Neither active nor shadow: skip (feature-flag off)
  return { ok: true, skipped: true }
}

export function startLedgerConsumer() {
  registerConsumer(CONSUMER_KEY, ledgerConsumer)
  return { consumerKey: CONSUMER_KEY, active: ACTIVE, shadow: SHADOW, supportedTypes: [...SUPPORTED_TYPES] }
}

export { CONSUMER_KEY, ACTIVE, SHADOW, SUPPORTED_TYPES, deriveIdempotencyKey, financialReplayGuard }
