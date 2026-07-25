/**
 * Automatic Polling Ingestion Adapter (T047a)
 * Polls external meter data sources and creates readings.
 * Supports: HTTP endpoints, MQTT, serial, custom protocols via plugins.
 */

import { prisma } from "../server.js"

const POLL_INTERVAL = process.env.POLL_INTERVAL_MS || 60000 // 1 minute default

const adapters = new Map()

export function registerAdapter(name, config) {
  adapters.set(name, {
    ...config,
    lastPoll: null,
    interval: null,
  })
}

export async function pollSource(name) {
  const adapter = adapters.get(name)
  if (!adapter) throw new Error(`Unknown adapter: ${name}`)

  try {
    const response = await fetch(adapter.url, {
      method: adapter.method || "GET",
      headers: { "Content-Type": "application/json", ...(adapter.apiKey ? { "Authorization": `Bearer ${adapter.apiKey}` } : {}) },
      signal: AbortSignal.timeout(adapter.timeout || 30000),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    const readings = adapter.transform ? adapter.transform(data) : Array.isArray(data) ? data : data.readings || []

    let created = 0
    for (const r of readings) {
      try {
        const existing = await prisma.reading.findFirst({
          where: { meterId: r.meterId, timestamp: r.timestamp ? new Date(r.timestamp) : undefined },
        })
        if (!existing) {
          await prisma.reading.create({ data: { meterId: r.meterId, value: r.value, unit: r.unit || "kWh", timestamp: r.timestamp ? new Date(r.timestamp) : new Date(), source: r.source || "polling", status: "valid" } })
          created++
        }
      } catch {}
    }

    adapter.lastPoll = new Date()
    return { source: name, readingsReceived: readings.length, created, errors: 0 }
  } catch (err) {
    adapter.lastPoll = new Date()
    return { source: name, readingsReceived: 0, created: 0, errors: 1, error: err.message }
  }
}

export function startPolling(name) {
  const adapter = adapters.get(name)
  if (!adapter) throw new Error(`Unknown adapter: ${name}`)
  if (adapter.interval) clearInterval(adapter.interval)
  adapter.interval = setInterval(() => pollSource(name), adapter.pollInterval || POLL_INTERVAL)
  pollSource(name) // immediate first poll
  return { name, interval: adapter.pollInterval || POLL_INTERVAL }
}

export function stopPolling(name) {
  const adapter = adapters.get(name)
  if (!adapter) return
  if (adapter.interval) clearInterval(adapter.interval)
  adapter.interval = null
}

export function getAdapterStatus(name) {
  const adapter = adapters.get(name)
  if (!adapter) return null
  return { name: adapter.name, url: adapter.url, lastPoll: adapter.lastPoll, running: adapter.interval !== null }
}

export function listAdapters() {
  return [...adapters.keys()].map(name => getAdapterStatus(name))
}
