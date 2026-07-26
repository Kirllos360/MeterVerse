import { readFileSync, writeFileSync } from 'fs';

const filePath = 'D:\\meter\\planning\\051_ENTERPRISE_PROCESS_ARCHITECTURE\\P10_MASTER_CONSOLIDATED.md';
let content = readFileSync(filePath, 'utf8');

const genericDoD = 'Process completed. Outputs verified. Audit trail created.';
const genericAC = 'All requirements satisfied. No errors detected.';

const dodMap = {
  'P-003': { dod: 'Old meter retired. New meter active at same location. Readings continuous.', ac: 'Old meter decommissioned. New serial linked. First reading OK.' },
  'P-004': { dod: 'Meter disconnected. Final reading captured. Customer notified.', ac: 'Disconnect order executed. Tag applied. Status = DISCONNECTED.' },
  'P-005': { dod: 'Meter reconnected. Communication verified.', ac: 'Reconnect order executed. Comm test passed. Status = ACTIVE.' },
  'P-006': { dod: 'Meter removed from inventory. Final audit complete. Records archived.', ac: 'Retirement approved. Asset status = RETIRED. Final report filed.' },
  'P-007': { dod: 'Meter parameters updated. Config change logged. Device confirmed.', ac: 'Config applied. Meter confirmed new values. Audit trail complete.' },
  'P-008': { dod: 'Firmware upgraded to target version. Rollback available. Test passed.', ac: 'Target version confirmed. Upgrade successful. Functional test passed.' },
  'P-009': { dod: 'Meter tested. Accuracy within tolerance. Certificate generated.', ac: 'Test results within spec. Certificate issued. Next test scheduled.' },
  'P-010': { dod: 'Meter calibrated. Tolerance verified. Seal applied.', ac: 'Calibration within tolerance. Seal tag applied. Calibration cert issued.' },
  'P-012': { dod: 'Manual reading recorded. Field tech confirmed. Route updated.', ac: 'Reading value saved. GPS location tagged. Route status updated.' },
  'P-013': { dod: 'Bulk file imported. All readings parsed. Validation queued.', ac: 'File parsed. Row count matches. Validation triggered for all readings.' },
  'P-015': { dod: 'Flagged reading reviewed. Approval decision recorded. Status updated.', ac: 'Approval action logged. Reading status = APPROVED. Audit timestamp set.' },
  'P-016': { dod: 'Invalid reading rejected. Correction workflow initiated. Audit logged.', ac: 'Rejection reason recorded. Correction ticket opened. Original preserved.' },
  'P-017': { dod: 'Reading corrected. Old value archived. Recalculation triggered.', ac: 'New value saved. Old value in audit log. Downstream recalc queued.' },
  'P-019': { dod: 'Abnormal pattern identified. Alert generated. Analyst notified.', ac: 'Pattern matched rules. Severity assigned. Alert sent to analyst.' },
  'P-020': { dod: 'Leak signature detected. Customer notified. Field dispatch queued.', ac: 'Continuous flow confirmed. Notification sent. Work order created.' },
  'P-022': { dod: 'Customer restored to active. Data integrity verified. Services reactivated.', ac: 'Customer status = ACTIVE. Archived data merged. All services live.' },
  'P-023': { dod: 'Customer archived. Data preserved. Final invoice generated.', ac: 'Customer status = ARCHIVED. Data exported. Final balance zeroed.' },
  'P-024': { dod: 'Customers merged. Duplicates removed. History consolidated.', ac: 'Primary customer retained. Duplicate flagged. Transaction history merged.' },
  'P-025': { dod: 'Customer migrated to new area. Old contract closed. New assignment confirmed.', ac: 'New area record created. Old area closed. Meter assignment updated.' },
  'P-026': { dod: 'Contract created. Terms recorded. Customer signed. Effective date set.', ac: 'Contract record exists. All terms populated. Signed document attached.' },
  'P-027': { dod: 'Contract renewed. Terms updated. Start date confirmed. Notification sent.', ac: 'Renewal effective. Updated terms saved. Renewal notice delivered.' },
  'P-028': { dod: 'Contract suspended. Reading schedule set. Reactivation trigger configured.', ac: 'Status = SUSPENDED. Suspension period set. Auto-reactivate configured.' },
  'P-029': { dod: 'Contract cancelled. Final bill generated. Meter disconnection scheduled.', ac: 'Status = CANCELLED. Final bill issued. Disconnect request submitted.' },
  'P-030': { dod: 'Bill cycle created. Meters assigned. Schedule confirmed.', ac: 'Cycle period defined. Meter list attached. Start/end dates set.' },
  'P-032': { dod: 'Bills previewed. Validation complete. Ready for execution.', ac: 'Preview report generated. Anomalies flagged. Approval status recorded.' },
  'P-034': { dod: 'Invoice approved. Version locked. Distribution queued.', ac: 'Approval timestamp set. Version frozen. Distribution batch created.' },
  'P-035': { dod: 'Invoice updated. Version incremented. Previous version archived.', ac: 'New version saved. Change log updated. Prior version accessible.' },
  'P-036': { dod: 'Invoice distributed via all channels. Delivery confirmed. Receipt logged.', ac: 'All channels processed. Delivery status tracked. Failed retries queued.' },
  'P-037': { dod: 'Email sent. Attachment included. Delivery status tracked.', ac: 'SMTP confirmed. PDF attached. Bounce handling active.' },
  'P-038': { dod: 'SMS sent. Customer notified. Delivery confirmed.', ac: 'Gateway confirmed. Delivery receipt received. Fallback queued.' },
  'P-039': { dod: 'Settlement data uploaded. Validation passed. Ready for approval.', ac: 'File parsed. Records validated. Totals match source.' },
  'P-040': { dod: 'Settlement approved. Financial impact calculated. Ledger queued.', ac: 'Approval recorded. Impact report generated. Journal entries prepared.' },
  'P-041': { dod: 'Settlement rolled back. Previous state restored. Audit log updated.', ac: 'Reversal posted. Original data restored. Audit trail complete.' },
  'P-042': { dod: 'Discount rules uploaded. Validation passed. Effective period set.', ac: 'Rules parsed. Conditions validated. Start/end dates confirmed.' },
  'P-043': { dod: 'Discount approved. Schedule confirmed. Application triggered.', ac: 'Approver signed. Schedule activated. First application batch queued.' },
  'P-044': { dod: 'Discount rolled back. Reversal posted. Customer notified.', ac: 'Reversal effective. Impact calculated. Notification sent.' },
  'P-046': { dod: 'Payment allocated to invoices. Remaining balance calculated. Ledger updated.', ac: 'Allocation rules applied. Remaining = 0 or partial. GL entries posted.' },
  'P-047': { dod: 'Partial payment applied. Outstanding balance tracked. Reminder scheduled.', ac: 'Payment split across invoices. Due amount updated. Next reminder date set.' },
  'P-048': { dod: 'Refund processed. Amount returned. Invoice adjusted. Ledger updated.', ac: 'Refund authorized. Payment gateway confirmed. Invoice credited.' },
  'P-049': { dod: 'Credit note issued. Customer balance adjusted. Ledger posted.', ac: 'Credit note generated. Balance reduced. GL entry complete.' },
  'P-050': { dod: 'Debit note issued. Customer account debited. Invoice updated.', ac: 'Debit note generated. Amount added. New invoice total calculated.' },
  'P-051': { dod: 'Account assigned to collector. Case created. Workflow initiated.', ac: 'Collector assigned. Priority set. First action scheduled.' },
  'P-052': { dod: 'Visit completed. Payment attempt recorded. Next action determined.', ac: 'Visit outcome logged. Payment collected or promise recorded. Follow-up set.' },
  'P-053': { dod: 'Collection case closed. Payment confirmed. Resolution logged.', ac: 'Full payment received. Case status = CLOSED. Collector notes archived.' },
  'P-054': { dod: 'Case escalated. Supervisor notified. Enhanced actions queued.', ac: 'Escalation level set. Legal or field action queued. Timeline updated.' },
  'P-055': { dod: 'Customer ledger updated. Transaction posted. Balance recalculated.', ac: 'Debit/credit applied. Running balance correct. Transaction reference stored.' },
  'P-057': { dod: 'Journal entry posted. Approval trail complete. Accounts in balance.', ac: 'Debit = credit. Account codes valid. Approval chain complete.' },
  'P-058': { dod: 'Bank statement reconciled. All transactions matched. Discrepancies resolved.', ac: 'Statement balance = system balance. Unmatched items resolved.' },
  'P-060': { dod: 'Fiscal year closed. Final reports generated. Books locked.', ac: 'Year-end adjustments posted. Reports archived. No further postings allowed.' },
  'P-061': { dod: 'SIM assigned to meter. Network registration confirmed. APN configured.', ac: 'ICCID linked. Network attach OK. APN profile set. Data session tested.' },
  'P-062': { dod: 'SIM replaced. New ICCID registered. Old SIM deactivated.', ac: 'New SIM active. Old SIM blocked in HLR. Meter comms restored.' },
  'P-063': { dod: 'Gateway registered. Certificate installed. Communication verified.', ac: 'Gateway record created. TLS cert installed. Head-end ping OK.' },
  'P-064': { dod: 'Gateway connected. Link established. Data flow confirmed.', ac: 'Connection state = CONNECTED. Data rate within spec. Redundancy active.' },
  'P-065': { dod: 'Communication test completed. End-to-end verified. Latency within threshold.', ac: 'Meter to head-end path verified. RTT within SLA. Packet loss < 1%.' },
  'P-066': { dod: 'Synchronization job completed. Conflicts identified. Consistency verified.', ac: 'All entities synced. Conflict count = 0 or flagged. Checksum matched.' },
  'P-067': { dod: 'Conflict resolved. Data reconciled. Source of truth established.', ac: 'Resolution rule applied. Both sides updated. Audit logged.' },
  'P-068': { dod: 'Area sync completed. All records matched. Divergence reported.', ac: 'Full sync cycle done. Record hash comparison passed. Differences logged.' },
  'P-069': { dod: 'Notification delivered. Channel confirmed. Receipt logged.', ac: 'Delivery confirmed. Channel status recorded. Failure retry exhausted.' },
  'P-070': { dod: 'Email delivered. Open tracked. Bounce handled.', ac: 'SMTP accepted. Tracking pixel embedded. Bounce processed per policy.' },
  'P-071': { dod: 'SMS delivered. Status confirmed. Delivery report received.', ac: 'Gateway delivery report received. DLR status = DELIVERED.' },
  'P-072': { dod: 'Push notification sent. Device reached. Engagement tracked.', ac: 'FCM/APNs accepted. Device online. Open rate logged.' },
  'P-074': { dod: 'Session terminated. Token invalidated. Audit logged.', ac: 'Session ID cleared. JWT blacklisted. Logout timestamp recorded.' },
  'P-075': { dod: 'Password reset. Verification email sent. Token expires in 24h.', ac: 'Reset token generated. Email delivered. Token expiry set.' },
  'P-076': { dod: 'MFA enrolled. Backup codes generated. Device registered.', ac: 'MFA method active. Backup codes printable. Device trusted.' },
  'P-077': { dod: 'Session recovered. New tokens issued. Previous session invalidated.', ac: 'Refresh token validated. New access token issued. Old session revoked.' },
  'P-078': { dod: 'User account created. Role pending. Welcome email sent.', ac: 'User record exists. Approval workflow triggered. Credentials delivered.' },
  'P-079': { dod: 'User approved. Account activated. Permissions granted.', ac: 'Status = ACTIVE. Default role assigned. Welcome notification sent.' },
  'P-080': { dod: 'Role assigned. Permissions updated. User notified.', ac: 'Role mapped to user. Permission set recalculated. Notification delivered.' },
  'P-081': { dod: 'Permissions updated. Access recalculated. Audit logged.', ac: 'Permission matrix updated. Session refresh required. Change recorded.' },
  'P-082': { dod: 'Configuration updated. Change logged. Impact assessed.', ac: 'New value applied. Old value backed up. Impact analysis documented.' },
  'P-083': { dod: 'Configuration approved. Change applied. Rollback available.', ac: 'Approval chain complete. Change deployed. Rollback script ready.' },
  'P-084': { dod: 'Feature toggled. Visibility updated. Environment confirmed.', ac: 'Toggle state flipped. Affected users/environments updated. Cache invalidated.' },
  'P-085': { dod: 'License validated. Expiry checked. Compliance confirmed.', ac: 'License key verified. Feature set enabled. Days to expiry reported.' },
  'P-087': { dod: 'Metrics collected. Thresholds evaluated. Alerts processed.', ac: 'Metric sample stored. All thresholds checked. Alert rules evaluated.' },
  'P-089': { dod: 'Restore completed. Data integrity verified. System operational.', ac: 'Restore from backup confirmed. Checksum match. Application health OK.' },
  'P-090': { dod: 'DR plan executed. Services restored. RTO/RPO met.', ac: 'Failover complete. Data loss within RPO. Services up within RTO.' },
  'P-091': { dod: 'Plugin installed. Dependencies resolved. Integration tested.', ac: 'Package deployed. Dependency tree satisfied. Smoke test passed.' },
  'P-092': { dod: 'Plugin upgraded. Backward compatibility verified. Data migration completed.', ac: 'New version active. Old version backed up. Data schema migrated.' },
  'P-093': { dod: 'Plugin removed. Dependencies cleaned. Configuration reverted.', ac: 'Plugin deactivated. Files purged. Config restored to previous.' },
  'P-095': { dod: 'Search executed. Results ranked. Sources cited.', ac: 'Query processed. Relevance scored. Top results returned with references.' },
  'P-096': { dod: 'Recommendation generated. Confidence scored. Context provided.', ac: 'Model inference complete. Score > threshold. Actionable output formatted.' },
  'P-097': { dod: 'Action executed. Outcome monitored. Audit logged.', ac: 'Automated action triggered. Success/failure status logged. Rollback available.' },
  'P-099': { dod: 'Alert acknowledged. Root cause identified. Resolution action taken.', ac: 'Ack timestamp set. RCA notes saved. Resolution steps documented.' },
  'P-100': { dod: 'Report generated. Data validated. Visualization ready.', ac: 'Query executed. Results validated. Chart/table rendered.' },
  'P-101': { dod: 'ERP sync completed. Records matched. Errors resolved.', ac: 'All entities synced. Mismatch report generated. Unmatched items resolved.' },
  'P-102': { dod: 'CRM sync completed. Contacts updated. Deals synchronized.', ac: 'Customer records matched. Activity log synced. Deals reconciled.' },
  'P-103': { dod: 'GIS sync completed. Assets matched. Coordinates verified.', ac: 'Asset locations matched. Coordinate accuracy confirmed. New assets registered.' },
  'P-104': { dod: 'SCADA sync completed. Telemetry aligned. Alarms synchronized.', ac: 'Telemetry stream matched. Alarm events reconciled. Historian updated.' },
  'P-105': { dod: 'IoT sync completed. Device data ingested. Stream processed.', ac: 'Device payload parsed. Timeseries stored. Downstream pipeline triggered.' },
  'P-106': { dod: 'Webhook delivered. Payload validated. Retry exhausted.', ac: 'HTTP 200 received. Payload schema valid. Max retries reached if failed.' },
  'P-107': { dod: 'Queue processed. Jobs completed. Dead letters handled.', ac: 'All messages dequeued. Failed messages in DLQ. Processing time within SLA.' },
  'P-108': { dod: 'Scheduler executed. Tasks completed. Next run scheduled.', ac: 'All tasks in batch executed. Status logged. Next trigger time set.' },
  'P-109': { dod: 'Incident created. Severity assigned. Team notified.', ac: 'Incident record saved. Priority set. On-call group paged.' },
  'P-110': { dod: 'Incident resolved. RCA documented. Service restored.', ac: 'Resolution actions completed. RCA report attached. Monitoring verified OK.' },
  'P-111': { dod: 'Problem identified. Root cause documented. Preventive action planned.', ac: 'Problem record created. Known error database updated. Fix scheduled.' },
  'P-112': { dod: 'Change approved. Implementation planned. Rollback prepared.', ac: 'CAB approval recorded. Change window scheduled. Rollback plan attached.' },
  'P-113': { dod: 'Release deployed. Smoke tests passed. Version tagged.', ac: 'Build promoted. Deployment verified. Git tag created. Release notes published.' },
  'P-114': { dod: 'Asset registered. Details recorded. Location mapped.', ac: 'Asset record exists. Barcode/serial assigned. GPS coordinates stored.' },
  'P-115': { dod: 'Asset maintained. Service performed. Next maintenance scheduled.', ac: 'Maintenance log updated. Parts replaced recorded. Next due date set.' },
  'P-116': { dod: 'Asset retired. Inventory updated. Disposal completed.', ac: 'Asset status = RETIRED. Inventory count adjusted. Disposal certificate filed.' },
  'P-117': { dod: 'Document uploaded. Virus scanned. Metadata indexed.', ac: 'File stored. Scan result clean. Search index updated. Version created.' },
  'P-118': { dod: 'Document approved. Version locked. Distribution authorized.', ac: 'Approval signature recorded. Document finalised. Access permissions set.' },
  'P-119': { dod: 'Audit exported. Format validated. Retention logged.', ac: 'Export file generated. Hash verified. Retention period recorded.' },
  'P-120': { dod: 'API request authenticated. Rate limit checked. Access granted.', ac: 'API key valid. Rate within quota. Response returned within SLA.' },
};

let count = 0;
for (const [pid, { dod, ac }] of Object.entries(dodMap)) {
  const sectionRegex = new RegExp(
    `(## ${pid}: .+?\\n\\n\\*\\*Group:.*?\\n\\*\\*Business Owner:.*?\\n\\n### Business Context\\n.*?\\n- \\*\\*Trigger:.*?\\n\\n### Definition of Done\\n)${escapeRegex(genericDoD)}(\\n### Acceptance Criteria\\n)${escapeRegex(genericAC)}`,
    's'
  );
  const replacement = `$1${dod}$2${ac}`;
  const newContent = content.replace(sectionRegex, replacement);
  if (newContent !== content) {
    content = newContent;
    count++;
    console.log(`✓ ${pid}: DoD/AC expanded`);
  } else {
    console.log(`✗ ${pid}: pattern not found (might already be specific)`);
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. Expanded ${count} DoD/AC entries.`);
