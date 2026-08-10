import { prisma } from '../src/db.js';

// P57: comprehensive permission seed — mirrors EVERY requirePermission key
// referenced across backend/src/routes (159 keys) so custom (non-system) roles
// can be granted granular access. Idempotent upsert.
const perms = [
  'accounting.accounts.create','accounting.accounts.delete','accounting.accounts.list','accounting.accounts.update',
  'accounting.events.list','accounting.events.post','accounting.general-ledger.list',
  'accounting.journal.create','accounting.journal.list','accounting.journal.post','accounting.journal.update',
  'accounting.mappings.create','accounting.mappings.delete','accounting.mappings.list','accounting.mappings.update',
  'accounting.periods.close','accounting.periods.create','accounting.periods.list','accounting.reports.trial-balance',
  'admin.audit','admin.emergency','admin.list','admin.sessions','admin.settings','admin.system','admin.update',
  'ai.feedback','ai.forecast','ai.monitor',
  'connections.create','connections.delete','connections.list','connections.read','connections.test','connections.update',
  'customers.create','customers.delete','customers.list','customers.read','customers.update',
  'documents.create','documents.update',
  'gateways.create','gateways.list',
  'governance.adrs.approve','governance.adrs.create','governance.adrs.list',
  'governance.compliance.create','governance.compliance.list',
  'governance.decisions.approve','governance.decisions.create','governance.decisions.list',
  'governance.exceptions.approve','governance.exceptions.create','governance.exceptions.list',
  'governance.findings.create','governance.findings.list','governance.findings.update',
  'governance.policies.approve','governance.policies.create','governance.policies.list',
  'governance.risks.assess','governance.risks.create','governance.risks.list',
  'governance.standards.approve','governance.standards.create','governance.standards.list',
  'governance.summary','governance.technical-debt.create','governance.technical-debt.list','governance.technical-debt.update',
  'governance.waivers.approve','governance.waivers.create','governance.waivers.list',
  'incidents.create','incidents.delete','incidents.list','incidents.read','incidents.update',
  'invoices.create','invoices.delete','invoices.edit','invoices.list',
  'knowledge.create','knowledge.list','knowledge.read',
  'learned_patterns.create','learned_patterns.delete','learned_patterns.list','learned_patterns.read','learned_patterns.update',
  'locations.areas.create','locations.areas.delete','locations.areas.update',
  'meters.create','meters.delete','meters.list',
  'monitor.read',
  'notifications.create',
  'payments.list',
  'readings.create','readings.delete','readings.edit','readings.list',
  'reporting.financial.create','reporting.financial.list',
  'revenue.findings.list','revenue.findings.update',
  'revenue.investigations.create','revenue.investigations.update',
  'revenue.rules.create','revenue.rules.delete','revenue.rules.list','revenue.rules.update','revenue.run',
  'tasks.create','tasks.delete','tasks.list','tasks.read','tasks.update',
  'tenant.create','tenant.environments.create','tenant.environments.list','tenant.list',
  'tenant.plans.create','tenant.plans.list','tenant.subscriptions.create','tenant.subscriptions.list',
  'tenant.subscriptions.update','tenant.summary','tenant.update','tenant.usage.list','tenant.usage.record',
  'workflow.approvals.create','workflow.approvals.list','workflow.approvals.update',
  'workflow.definitions.approve','workflow.definitions.create','workflow.definitions.list',
  'workflow.instances.create','workflow.instances.list','workflow.instances.update','workflow.summary',
  // Wildcard-backed concrete keys kept for custom-role granularity (billing/customers/etc.)
  'billing.cycles.list','billing.cycles.create','billing.runs.list','billing.runs.create',
  'tariffs.list','tariffs.create','tariffs.update','tariffs.delete',
  'collections.cases.list','collections.cases.create','collections.cases.update',
  'sim.list','sim.create','sim.update','sim.delete','sim.assign','sim.deassign',
  'projects.list','projects.create','projects.update','projects.delete',
  'sessions.list','sessions.delete',
  'reports.list','reports.create','reports.export',
  'security.audit.list','api_keys.list','api_keys.create','api_keys.delete',
  'documents.list','documents.read','documents.delete',
  'meter_assignments.list','meter_assignments.create','meter_assignments.update','meter_assignments.delete',
  'notifications.list','notifications.read','notifications.update','notifications.delete',
];

const seen = new Set();
for (const key of perms) {
  if (seen.has(key)) continue;
  seen.add(key);
  await prisma.permission.upsert({
    where: { name: key },
    update: {},
    create: { name: key, module: key.split('.')[0], description: 'Permission for ' + key },
  });
}

const count = await prisma.permission.count();
console.log('Total permission keys in DB: ' + count);
await prisma.$disconnect();
