// Ingestion Runtime — wires the real meter-data ingestion path (P45-K).
// 1. Starts the Symbiot TCP bridge (external meter data stream listener).
// 2. Registers active ConnectionProfiles as polling adapters so the platform
//    polls real meter/DB sources on an interval and persists readings.
// This closes the orphan gap: polling-ingestion.js + symbiot-bridge.js are now
// active at server boot instead of dead services.

import { prisma } from "../db.js"
import { createSymbiotBridge, getSymbiotStatus } from "./symbiot-bridge.js"
import { registerAdapter, startPolling, stopPolling, listAdapters } from "./polling-ingestion.js"
import logger from "./logger.js"

const POLLING_ENABLED = process.env.METER_INGESTION_ENABLED !== "false"

let bridge = null
const activePollers = new Set()

/**
 * Start the ingestion runtime: TCP bridge + polling adapters from active
 * connection profiles.
 */
export async function startIngestion() {
  if (bridge) return { bridge: getSymbiotStatus(), pollers: listAdapters() }

  // 1) TCP bridge
  try {
    bridge = createSymbiotBridge()
  } catch (err) {
    logger.warn({ component: "ingestion", err: err.message }, "Symbiot TCP bridge failed to start (port may be in use)")
  }

  // 2) Polling adapters from active connection profiles
  if (POLLING_ENABLED) {
    const profiles = await prisma.connectionProfile.findMany({ where: { active: true } })
    for (const p of profiles) {
      const url = p.dbType === "http" || p.dbType === "rest"
        ? `http://${p.host}:${p.port}`
        : `http://${p.dbHost}:${p.dbPort}`
      registerAdapter(`profile-${p.id}`, {
        url,
        method: "GET",
        timeout: p.queryTimeout * 1000 || 30000,
        pollInterval: p.heartbeatInterval * 1000 || 60000,
      })
      try {
        startPolling(`profile-${p.id}`)
        activePollers.add(p.id)
      } catch (err) {
        logger.warn({ component: "ingestion", profileId: p.id, err: err.message }, "Adapter start failed")
      }
    }
    logger.info({ component: "ingestion", profiles: profiles.length }, "Polling adapters registered")
  }

  return { bridge: getSymbiotStatus(), pollers: listAdapters() }
}

export async function stopIngestion() {
  for (const id of activePollers) {
    try { stopPolling(`profile-${id}`) } catch {}
  }
  activePollers.clear()
  if (bridge?.tcpServer) {
    try { bridge.tcpServer.close() } catch {}
  }
  bridge = null
}

export function getIngestionStatus() {
  return {
    enabled: POLLING_ENABLED,
    bridge: bridge ? getSymbiotStatus() : { status: "stopped" },
    pollers: listAdapters(),
    activePollers: activePollers.size,
  }
}

export { logger as ingestionLogger }
