import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const schemaPath = join(import.meta.dirname, '..', 'prisma', 'schema.prisma');
let content = readFileSync(schemaPath, 'utf8');

const indexes = {
  User: '  @@index([roleId])\n  @@index([status, createdAt])\n',
  PermissionOnRole: '  @@index([permissionId])\n',
  AuditEntry: '  @@index([actorId])\n  @@index([action, timestamp])\n  @@index([resource, resourceId])\n',
  ApiKey: '  @@index([userId])\n  @@index([active])\n',
  Session: '  @@index([userId, isActive])\n  @@index([expiresAt])\n',
  Project: '  @@index([organizationId, status])\n',
  KpiSnapshot: '  @@index([kpiId, recordedAt])\n',
  Meter: '  @@index([customerId])\n  @@index([status, createdAt])\n',
  Reading: '  @@index([meterId, timestamp])\n  @@index([status])\n',
  Invoice: '  @@index([customerId, status])\n  @@index([status, createdAt])\n  @@index([dueDate])\n',
  Payment: '  @@index([invoiceId, status])\n  @@index([paidAt])\n',
  Contract: '  @@index([customerId, status])\n  @@index([status, createdAt])\n  @@index([startDate])\n',
  ContractTerm: '  @@index([contractId])\n',
  ContractAmendment: '  @@index([contractId])\n',
  TariffRate: '  @@index([tariffId])\n',
  TariffTier: '  @@index([tariffId])\n',
  BillRun: '  @@index([billCycleId])\n  @@index([status, createdAt])\n',
  BillRunHistory: '  @@index([billRunId])\n',
  ChargeOverride: '  @@index([chargeRuleId])\n  @@index([customerId])\n  @@index([contractId])\n',
  InvoiceItem: '  @@index([invoiceId, type])\n',
  InvoiceTax: '  @@index([invoiceItemId])\n',
  DiscountRule: '  @@index([invoiceItemId])\n',
  MeterAssignment: '  @@index([meterId])\n  @@index([customerId, status])\n  @@index([contractId])\n',
  MeterAssignmentHistory: '  @@index([meterAssignmentId])\n',
  MeterEvent: '  @@index([meterId, timestamp])\n  @@index([type, status])\n',
  ValidationResult: '  @@index([validationRuleId])\n  @@index([entityType, entityId])\n  @@index([status])\n',
  WorkflowTransition: '  @@index([workflowStateId])\n',
  CollectionCase: '  @@index([customerId, status])\n  @@index([invoiceId])\n  @@index([priority, status])\n',
  CollectionAction: '  @@index([collectionCaseId])\n',
  PromiseToPay: '  @@index([collectionCaseId])\n  @@index([status])\n',
  PaymentTransaction: '  @@index([gatewayId])\n  @@index([paymentId])\n  @@index([status, createdAt])\n',
  GatewayLog: '  @@index([paymentTransactionId])\n',
  GroupMember: '  @@index([customerGroupId, customerId])\n',
  GroupPricing: '  @@index([customerGroupId])\n  @@index([tariffId])\n',
  SLABreach: '  @@index([slaId, breachedAt])\n',
  SLAEscalation: '  @@index([slaId])\n',
  GroupSLA: '  @@index([customerGroupId])\n  @@index([slaId])\n',
  Alert: '  @@index([alertRuleId])\n  @@index([entityType, entityId])\n  @@index([status, createdAt])\n',
  EscalationStep: '  @@index([escalationPolicyId])\n',
};

let count = 0;
let totalIdx = 0;

for (const [model, idxDef] of Object.entries(indexes)) {
  const search = 'model ' + model + ' {';
  const pos = content.indexOf(search);
  if (pos >= 0) {
    const closingBrace = content.indexOf('\n}', pos);
    if (closingBrace >= 0) {
      content = content.slice(0, closingBrace + 1) + '\n' + idxDef + content.slice(closingBrace + 1);
      count++;
      totalIdx += (idxDef.match(/@@index/g) || []).length;
    }
  } else {
    console.error('  Model not found:', model);
  }
}

writeFileSync(schemaPath, content);
console.log('Updated ' + count + ' models with ' + totalIdx + ' @@index directives');
