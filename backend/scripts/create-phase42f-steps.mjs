import { mkdirSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const base = 'D:/meter/planning/001_WAVES/Wave_01_Enterprise_Hardening/Phases/Phase_42f_Communication_Billing';
const promptSrc = 'D:/meter/planning/900_TEMPLATES/PROMPTS';

const steps = {
  'T17_Email_Engine/Steps/S01_Install_Nodemailer': 'Install Nodemailer and configure SMTP',
  'T17_Email_Engine/Steps/S02_Wire_EmailLog': 'Wire EmailLog to actual sending',
  'T17_Email_Engine/Steps/S03_Add_Email_Queue': 'Add email queue for retry',
  'T18_SMS_Engine/Steps/S01_Add_SMS_Adapter': 'Add SMS provider adapter',
  'T18_SMS_Engine/Steps/S02_Wire_SmsLog': 'Wire SmsLog to actual sending',
  'T19_Billing_Engine/Steps/S01_Implement_ChargeRules': 'Implement ChargeRule evaluation',
  'T19_Billing_Engine/Steps/S02_Implement_BillRun': 'Implement BillRun generation',
  'T19_Billing_Engine/Steps/S03_Wire_Invoice_Generation': 'Wire invoice generation from readings',
  'T19_Billing_Engine/Steps/S04_Add_Tax_Discount': 'Add invoice tax/discount calculation',
  'T20_Validation_Engine/Steps/S01_Wire_Validation_Rules': 'Wire ValidationRule into reading creation',
  'T20_Validation_Engine/Steps/S02_Add_Validation_API': 'Add validation results API',
  'T99_Phase_Audit/Steps/S01_Audit_Planning_Docs': 'Audit planning docs',
  'T99_Phase_Audit/Steps/S02_Audit_Graph_Architecture': 'Audit graph/architecture',
  'T99_Phase_Audit/Steps/S03_Audit_Frontend_Structure': 'Audit frontend structure',
  'T99_Phase_Audit/Steps/S04_Audit_Backend_Structure': 'Audit backend structure',
  'T99_Phase_Audit/Steps/S05_Audit_Database_Design': 'Audit database design',
  'T99_Phase_Audit/Steps/S06_Audit_Process_Flow': 'Audit process flow',
  'T99_Phase_Audit/Steps/S07_Audit_KPI_Flow': 'Audit KPI flow',
};

for (const [stepPath, label] of Object.entries(steps)) {
  const dir = join(base, 'Tasks', stepPath);
  mkdirSync(join(dir, 'Prompts'), { recursive: true });

  const stepStatus = 'step:\n  name: "' + label + '"\n  status: "PLANNING"\n  estimated_hours: 4\n  evidence_required:\n    - "Step completed and verified"';
  writeFileSync(join(dir, 'STEP_STATUS.yaml'), stepStatus);

  if (existsSync(promptSrc)) {
    const files = readdirSync(promptSrc);
    for (const f of files) {
      copyFileSync(join(promptSrc, f), join(dir, 'Prompts', f));
    }
  }
}
console.log('Created ' + Object.keys(steps).length + ' step files with prompts');
