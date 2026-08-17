// P12.2-D — Outbox dispatcher + pilot ledger consumer (P12-03-02)
// Completes the P12.2 outbox pipeline: producer (enqueueEvent) -> dispatcher ->
// consumer, with at-least-once delivery, idempotency, dead-letter and retry.
import { prisma } from "../db.js"
import logger from "./logger.js"

const DISPATCH_LIMIT = Number(process.env.OUTBOX_DISPATCH_LIMIT) || 50
const RETRY_BACKOFF_MS = Number(process.env.OUTBOX_RETRY_BACKOFF_MS) || 5000
const MAX_ATTEMPTS = Number(process.env.OUTBOX_MAX_ATTEMPTS) || 5

// Registered consumers: consumerKey -> async handler(event) => {ok, error?}
const consumers = new Map()

export function registerConsumer(consumerKey, handler) {
  consumers.set(consumerKey, handler)
  return consumerKey
}

// Claim a batch of events (PENDING + PUBLISHED-with-pending-delivery) whose
// nextRetryAt has passed (at-least-once via lockedAt/lockedBy claim; a crashed
// worker leaves a lock, recovered by timeout).
async function claimEvents(workerId, limit) {
  const now = new Date()
  const claim = await prisma.$transaction(async (tx) => {
    const events = await tx.outboxEvent.findMany({
      where: {
        status: { in: ["PENDING", "PUBLISHED"] },
        OR: [
          { status: "PENDING", OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }] },
          { status: "PUBLISHED", deliveries: { some: { status: "PENDING", attempts: { lt: MAX_ATTEMPTS } } } },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    })
    const ids = events.map((e) => e.id)
    if (ids.length > 0) {
      await tx.outboxEvent.updateMany({
        where: { id: { in: ids } },
        data: { lockedAt: now, lockedBy: workerId, lastAttemptAt: now, attemptCount: { increment: 1 } },
      })
    }
    return events
  })
  return claim
}

// Dispatch a single event to all matching consumers.
// Per-consumer delivery is tracked independently (each EventDelivery reaches
// DELIVERED or DEAD on its own) so a failing consumer does not block others
// and is retried/DEAD even when the event is PUBLISHED by another consumer.
async function dispatchEvent(event, workerId) {
  let anyDelivered = false
  for (const [consumerKey, handler] of consumers) {
    const delivery = await prisma.eventDelivery.upsert({
      where: { eventId_consumerKey: { eventId: event.id, consumerKey } },
      create: { eventId: event.id, consumerKey, status: "PENDING", attempts: 0 },
      update: {},
    })
    if (delivery.status === "DELIVERED") { anyDelivered = true; continue }
    if (delivery.status === "DEAD") continue

    try {
      const result = await handler(event)
      if (result.ok) {
        await prisma.eventDelivery.update({
          where: { id: delivery.id },
          data: { status: "DELIVERED", deliveredAt: new Date() },
        })
        anyDelivered = true
      } else {
        throw new Error(result.error || "consumer handler returned not-ok")
      }
    } catch (err) {
      const attempts = delivery.attempts + 1
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.eventDelivery.update({ where: { id: delivery.id }, data: { status: "DEAD", attempts, lastError: err.message } })
        await prisma.eventDeadLetter.upsert({
          where: { eventId_consumerKey: { eventId: event.id, consumerKey } },
          create: { eventId: event.id, consumerKey, reason: "max_attempts", lastError: err.message },
          update: { lastError: err.message },
        })
      } else {
        await prisma.eventDelivery.update({ where: { id: delivery.id }, data: { status: "PENDING", attempts, lastError: err.message } })
      }
    }
  }
  if (anyDelivered) {
    await prisma.outboxEvent.update({ where: { id: event.id }, data: { lockedAt: null, lockedBy: null, status: "PUBLISHED", publishedAt: new Date() } })
  } else if (event.attemptCount >= MAX_ATTEMPTS) {
    // no consumer delivered after max attempts -> DEAD at event level
    await prisma.outboxEvent.update({ where: { id: event.id }, data: { lockedAt: null, lockedBy: null, status: "DEAD", lastError: "max attempts, no consumer delivered" } })
  } else {
    // retry at event level with backoff (so PENDING-delivery events are re-claimed)
    await prisma.outboxEvent.update({ where: { id: event.id }, data: { lockedAt: null, lockedBy: null, status: "PENDING", nextRetryAt: new Date(Date.now() + RETRY_BACKOFF_MS * event.attemptCount) } })
  }
}

// Run one dispatch cycle; returns count processed.
export async function runDispatchCycle(workerId = `worker-${process.pid}`) {
  const events = await claimEvents(workerId, DISPATCH_LIMIT)
  for (const event of events) {
    await dispatchEvent(event, workerId)
  }
  return events.length
}

export { consumers, DISPATCH_LIMIT, RETRY_BACKOFF_MS, MAX_ATTEMPTS }
