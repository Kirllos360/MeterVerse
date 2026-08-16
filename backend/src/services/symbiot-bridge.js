// Symbiot Bridge — TCP + HTTP multiplex for external meter data ingestion (T091)
import { createServer } from 'net';
import { request } from 'http';
import { prisma } from '../db.js';

const connections = new Map();
const MAX_TCP = 10;
const MAX_HTTP = 100;

export function createSymbiotBridge(options = {}) {
  const { tcpPort = Number(process.env.SYMBIOT_TCP_PORT) || 9000, httpPort = Number(process.env.SYMBIOT_HTTP_PORT) || 9001 } = options;

  // TCP server for raw meter data streams
  const tcpServer = createServer((socket) => {
    const id = `tcp-${Date.now()}`;
    if (connections.size >= MAX_TCP) {
      socket.write('ERROR: Max TCP connections reached\n');
      return socket.destroy();
    }
    connections.set(id, { type: 'tcp', socket, createdAt: new Date() });
    socket.on('data', (data) => handleIngress(id, data));
    socket.on('close', () => connections.delete(id));
    socket.write(`SYMBIOT: Connected (${connections.size}/${MAX_TCP})\n`);
  });

  tcpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[symbiot] TCP port ${tcpPort} in use — bridge skipped (ingestion continues via polling)`);
      return;
    }
    console.error(`[symbiot] TCP error: ${err.message}`);
  });
  tcpServer.listen(tcpPort, () => console.log(`[symbiot] TCP bridge on :${tcpPort}`));

  // HTTP endpoint for JSON meter-reading POSTs (Symbiot/SEP push)
  const httpServer = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/readings') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const result = await ingestReading(payload);
        res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
  });
  httpServer.listen(httpPort, () => console.log(`[symbiot] HTTP bridge on :${httpPort}`));

  return { tcpServer, httpServer, connections };
}

// Ingest a reading from an external (Symbiot/SEP) meter identity.
// Maps the external meter serial to a MeterVerse Meter, then persists a Reading
// with tenancy (areaId/projectId) propagated from the meter. Fail-closed: an
// unknown serial or missing value is rejected (nothing silently dropped).
export async function ingestReading(payload = {}) {
  const meterSerial = payload.meter ?? payload.serial ?? payload.meterSerial ?? payload.meter_id
  const value = payload.value ?? payload.reading
  if (!meterSerial) return { ok: false, error: 'missing meter serial', code: 'MISSING_METER' }
  if (value === null || value === undefined || Number.isNaN(Number(value))) return { ok: false, error: 'missing or invalid reading value', code: 'INVALID_VALUE' }

  const meter = await prisma.meter.findUnique({ where: { serial: String(meterSerial) } })
  if (!meter) return { ok: false, error: `unknown meter serial '${meterSerial}'`, code: 'UNKNOWN_METER' }

  const reading = await prisma.reading.create({
    data: {
      meterId: meter.id,
      value: Number(value),
      source: payload.source || 'symbiot',
      unit: payload.unit || 'kWh',
      status: 'valid',
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      areaId: meter.areaId,
      projectId: meter.projectId ?? null,
    },
  })
  return { ok: true, readingId: reading.id, meterId: meter.id, value: Number(value), source: 'symbiot' }
}

async function handleIngress(id, data) {
  try {
    const parsed = JSON.parse(data.toString());
    const result = await ingestReading(parsed);
    if (result.ok) {
      console.log(`[symbiot] ${id}: persisted ${result.source} reading ${result.value} for meter ${result.meterId}`);
    } else {
      console.warn(`[symbiot] ${id}: rejected — ${result.error}`);
    }
  } catch {
    console.log(`[symbiot] ${id}: raw ${data.length} bytes (non-JSON, skipped)`);
  }
}

export function getSymbiotStatus() {
  return {
    tcpConnections: connections.size,
    maxTcp: MAX_TCP,
    httpMultiplex: MAX_HTTP,
    status: connections.size > 0 ? 'active' : 'idle',
  };
}
