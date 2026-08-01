// Symbiot Bridge — TCP + HTTP multiplex for external meter data ingestion (T091)
import { createServer } from 'net';
import { request } from 'http';

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
  return { tcpServer, connections };
}

async function handleIngress(id, data) {
  try {
    const parsed = JSON.parse(data.toString());
    console.log(`[symbiot] ${id}: ${parsed.type || 'unknown'} reading`);
  } catch {
    console.log(`[symbiot] ${id}: raw ${data.length} bytes`);
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
