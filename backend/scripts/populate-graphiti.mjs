import { writeFileSync, readFileSync } from 'fs';

const graph = {
  name: "MeterVerse Knowledge Graph",
  version: "2.0.0",
  description: "Complete knowledge graph — all models, routes, pages, databases, decisions",
  updated: new Date().toISOString(),
  schema: {
    nodes: ["component", "module", "api", "database", "decision", "spec", "runtime", "page", "middleware"],
    edges: ["depends_on", "implements", "extends", "contains", "references", "documents", "connects_to", "deployed_as"]
  },
  nodes: [],
  edges: []
};

let id = 1;
function addNode(type, name, group, desc) {
  graph.nodes.push({ id: id++, type, name, group, description: desc });
  return id - 1;
}
function addEdge(from, to, type) {
  graph.edges.push({ source: from, target: to, type });
}

// ─── DATABASE NODES (78 models) ───
const dbCore = addNode("database", "PostgreSQL", "Database", "Primary database - meter_pulse on port 5433");
const prisma = addNode("database", "Prisma ORM", "Database", "ORM layer - 78 models, schema.prisma");

const coreModels = ["User","Role","Permission","PermissionOnRole","AuditEntry","Customer","Meter","Reading","Invoice","Payment","Contract","Tariff","BillCycle","MeterAssignment","Organization","Project","Notification","NotificationTemplate","AlertRule","KpiDefinition"];
const modelNodes = {};
for (const m of coreModels) {
  modelNodes[m] = addNode("database", m, "Prisma Model", "Core domain model");
  addEdge(prisma, modelNodes[m], "contains");
}

// ─── BACKEND ROUTES (17 route files) ───
const routes = ["auth","admin","customers","meters","readings","invoices","payments","contracts","meter-assignments","notifications","reports","services","security","monitor","crud","business","ai","domain"];
const routeNodes = {};
for (const r of routes) {
  const nodeId = addNode("api", "/api/" + r, "API Route", "Express route handler");
  routeNodes[r] = nodeId;
  addEdge(nodeId, dbCore, "connects_to");
}

// ─── FRONTEND PAGES (53 admin pages) ───
const adminPages = ["customers","meters","readings","invoices","payments","users","roles","permissions","audit","reports","settings","notifications","notification-templates","security","sessions","api-keys","backup","cache","queue","scheduler","storage","logs","monitoring","health","database","themes","branding","localization","translations","feature-flags","license","plugins","integrations","webhooks","organizations","projects","service-connections","services","domains","crud","business","ai","ai-diagnostics","areas","active-devices","smtp","sms","tables","import","export"];
const pageNodes = {};
for (const p of adminPages) {
  const nodeId = addNode("page", "admin/" + p, "Admin Page", "Next.js admin page");
  pageNodes[p] = nodeId;
}

// ─── FRONTEND USER PAGES (19 dashboard pages) ───
const dashPages = ["overview","customers","meters","readings","invoices","billing","payments","notifications","settings","profile","workspace","workspaces","product","forms","elements","kanban","chat","react-query","exclusive"];
for (const p of dashPages) {
  addNode("page", "dashboard/" + p, "User Dashboard Page", "Next.js user dashboard page");
}

// ─── MIDDLEWARE ───
const authMw = addNode("middleware", "authenticate", "Security", "JWT authentication middleware");
const rbacMw = addNode("middleware", "requireRole/requirePermission", "Security", "RBAC + Permission gates");
const auditMw = addNode("middleware", "auditLog", "Security", "Audit logging middleware");
const errorMw = addNode("middleware", "errorHandler", "Security", "Global error handler");

// ─── DECISIONS ───
addNode("decision", "ADR-001", "Architecture", "BFF Pattern - Backend for Frontend");
addNode("decision", "ADR-002", "Architecture", "Design Token System");
addNode("decision", "ADR-003", "Architecture", "V3 Database Trigger Pattern");

// ─── RUNTIME ───
addNode("runtime", "Notification Engine", "Service", "Event-driven notification dispatch");
addNode("runtime", "Rate Limiter", "Service", "Request rate limiting (express-rate-limit)");

// ─── EDGES: Routes ↔ Models ───
addEdge(routeNodes["customers"], modelNodes["Customer"], "manages");
addEdge(routeNodes["meters"], modelNodes["Meter"], "manages");
addEdge(routeNodes["readings"], modelNodes["Reading"], "manages");
addEdge(routeNodes["invoices"], modelNodes["Invoice"], "manages");
addEdge(routeNodes["payments"], modelNodes["Payment"], "manages");

// ─── EDGES: API ↔ Frontend ───
addEdge(pageNodes["customers"], routeNodes["customers"], "calls");
addEdge(pageNodes["meters"], routeNodes["meters"], "calls");
addEdge(pageNodes["readings"], routeNodes["readings"], "calls");
addEdge(pageNodes["invoices"], routeNodes["invoices"], "calls");
addEdge(pageNodes["payments"], routeNodes["payments"], "calls");
addEdge(pageNodes["notifications"], routeNodes["notifications"], "calls");

// ─── EDGES: Middleware → Routes ───
for (const r of Object.values(routeNodes)) {
  addEdge(r, authMw, "uses");
  addEdge(r, rbacMw, "uses");
  addEdge(r, auditMw, "uses");
}

writeFileSync('D:/meter/graphiti/index.json', JSON.stringify(graph, null, 2));
console.log('Graphiti graph populated: ' + graph.nodes.length + ' nodes, ' + graph.edges.length + ' edges');
