// P12.2-C / P12-03-03 — enqueueEvent outbox producer
// Single entry point for publishing domain events to the transactional outbox.
// - Writes OutboxEvent in the SAME tx as the caller's domain mutation (atomic).
// - Feature-flag aware: OUTBOX_ENABLED=true writes outbox; FINANCIAL_POSTING_ENABLED
//   controls the legacy postEvent side-effect (dual-publish / shadow phase).
// - Idempotency: producer derives idempotencyKey from sourceId + eventType so
//   re-delivery/replay is deduped at the consumer.
import crypto from "crypto"
import { prisma } from "../db.js"
import { postEvent } from "./posting-engine.js"

const OUTBOX_ENABLED = () => process.env.OUTBOX_ENABLED === "true"
const FINANCIAL_POSTING_ENABLED = () => process.env.FINANCIAL_POSTING_ENABLED !== "false"

function deriveIdempotencyKey({ sourceId, eventType, amount, description }) {
  const raw = `${sourceId}:${eventType}:${amount ?? 0}:${description ?? ""}`
  return crypto.createHash("sha256").update(raw).digest("hex")
}

function nowIso() {
  return new Date().toISOString()
}

/**
 * enqueueEvent — transactional outbox producer (P12-03-03 §1/§3).
 * Call within the same prisma.$transaction as the domain mutation for atomicity.
 *
 * @param {object} input { sourceType, sourceId, eventType, amount, description, context={} }
 * @param {object} opts  { tx=prisma, correlationId, causationId, actorId }
 * @returns {Promise<{ok:boolean, outboxId?:string, legacy?:object, outboxEnabled:boolean}>}
 */
export async function enqueueEvent(input, opts = {}) {
  const { sourceType, sourceId, eventType, amount = 0, description, context = {} } = input || {}
  const { tx = prisma, correlationId = null, causationId = null, actorId = null } = opts

  const idempotencyKey = deriveIdempotencyKey({ sourceId, eventType, amount, description })
  const outboxEnabled = OUTBOX_ENABLED()

  let outboxId = null
  if (outboxEnabled) {
    const event = await tx.outboxEvent.create({
      data: {
        eventType,
        eventVersion: 1,
        aggregateType: sourceType,
        aggregateId: String(sourceId),
        tenantId: context.tenantId || null,
        areaId: context.areaId || null,
        projectId: context.projectId || null,
        correlationId: correlationId || context.correlationId || "unknown",
        causationId: causationId || null,
        idempotencyKey,
        payload: JSON.stringify({ sourceType, sourceId, eventType, amount, description, context }),
        metadata: JSON.stringify({ producer: "enqueueEvent", sourceService: context.sourceService || "billing" }),
        sourceService: context.sourceService || "billing",
        actorId: actorId || null,
        occurredAt: new Date(),
      },
    })
    outboxId = event.id
  }

  let legacy = null
  if (FINANCIAL_POSTING_ENABLED()) {
    legacy = await postEvent({ sourceType, sourceId, eventType, amount, description, context, tx })
  }

  return { ok: true, outboxId, legacy, outboxEnabled }
}

export { OUTBOX_ENABLED, FINANCIAL_POSTING_ENABLED, deriveIdempotencyKey, nowIso }
