import { mkdirSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const WAVES_ROOT = 'D:/meter/planning/001_WAVES';
const PROMPTS_SRC = 'D:/meter/planning/900_TEMPLATES/PROMPTS';
const STEP_DOCS = 'D:/meter/planning/900_TEMPLATES/step-docs';

const waves = [
  {
    name: 'Wave_02_User_Experience_Communication',
    vision: 'Complete the user workspace, add real-time communication, documents, and accessibility',
    phases: [
      { name: 'Phase_43a_User_Workspace_Completion', tasks: ['T01_Build_Tasks_Module','T02_Build_Search','T03_Build_Command_Palette','T04_User_Preferences'] },
      { name: 'Phase_43b_Communication_RealTime', tasks: ['T05_WebSocket_Gateway','T06_Email_Delivery','T07_SMS_Delivery','T08_Push_Notifications'] },
      { name: 'Phase_43c_Documents_Files', tasks: ['T09_Document_Upload_UI','T10_Document_Templates'] },
      { name: 'Phase_43d_UX_Accessibility', tasks: ['T11_Accessibility_Audit','T12_Breadcrumb_Navigation','T13_ErrorBoundary_Wrapper','T14_Loading_States'] },
    ]
  },
  {
    name: 'Wave_03_Enterprise_Billing_Tariff',
    vision: 'Complete billing pipeline: tariff evaluation, bill runs, collections, compliance',
    phases: [
      { name: 'Phase_44a_Tariff_Engine', tasks: ['T01_Tariff_Evaluation','T02_TimeOfUse_Pricing','T03_Tiered_Pricing','T04_Demand_Pricing'] },
      { name: 'Phase_44b_Billing_Pipeline', tasks: ['T05_BillRun_Engine','T06_Invoice_Itemization','T07_Discount_Engine','T08_Tax_Engine'] },
      { name: 'Phase_44c_Collections_Payments', tasks: ['T09_Collection_Workflow','T10_Payment_Gateway','T11_PromiseToPay'] },
      { name: 'Phase_44d_Billing_Compliance', tasks: ['T12_Invoice_Compliance','T13_Billing_Audit_Trail','T14_Billing_Reports'] },
    ]
  },
  {
    name: 'Wave_04_Platform_Hardening_Scale',
    vision: 'Performance, security, multi-tenancy, observability, disaster recovery',
    phases: [
      { name: 'Phase_45a_Performance', tasks: ['T01_Query_Performance','T02_Redis_Caching','T03_CDN_Configuration','T04_Connection_Pooling'] },
      { name: 'Phase_45b_Security', tasks: ['T05_Penetration_Testing','T06_Dependency_Auditing','T07_Secret_Scanning','T08_CORS_Hardening'] },
      { name: 'Phase_45c_MultiTenancy', tasks: ['T09_Organization_Isolation','T10_Tenant_Provisioning','T11_CrossOrg_Reports'] },
      { name: 'Phase_45d_Observability', tasks: ['T12_Structured_Logging','T13_Metrics_Dashboard','T14_Distributed_Tracing','T15_SLA_Monitoring'] },
      { name: 'Phase_45e_Disaster_Recovery', tasks: ['T16_Automated_Backups','T17_PointInTime_Recovery','T18_Failover_Testing','T19_Runbook_Documentation'] },
    ]
  },
  {
    name: 'Wave_05_AI_Intelligence',
    vision: 'AI-powered anomaly detection, forecasting, analytics, automation, integrations',
    phases: [
      { name: 'Phase_46a_AI_Engine', tasks: ['T01_Anomaly_Detection','T02_Consumption_Forecasting','T03_Payment_Prediction','T04_AI_Chat_Assistant'] },
      { name: 'Phase_46b_Analytics', tasks: ['T05_RealTime_Dashboard','T06_Custom_Report_Builder','T07_KPI_Alerts'] },
      { name: 'Phase_46c_Automation', tasks: ['T08_Workflow_Engine','T09_Scheduled_Jobs','T10_Webhook_Delivery'] },
      { name: 'Phase_46d_Integrations', tasks: ['T11_OpenAPI_Swagger','T12_API_Versioning','T13_External_Connectors'] },
    ]
  },
  {
    name: 'Wave_06_Mobile_Enterprise_Release',
    vision: 'Mobile API, production deployment, load testing, go-live',
    phases: [
      { name: 'Phase_47a_Mobile_API', tasks: ['T01_Mobile_Endpoints','T02_Offline_Support','T03_Push_Integration'] },
      { name: 'Phase_47b_Enterprise_Release', tasks: ['T04_Production_Environment','T05_Load_Testing','T06_Security_Audit','T07_Performance_Baseline','T08_Documentation_Complete','T09_Training_Materials','T10_GoLive_Checklist'] },
      { name: 'Phase_47c_PostLaunch', tasks: ['T11_Incident_Response','T12_Support_Tiers','T13_Feature_Pipeline'] },
    ]
  }
];

const T99_STEPS = ['S00_Verification_Loop','S01_Audit_Planning_Docs','S02_Audit_Graph_Architecture','S03_Audit_Frontend_Structure','S04_Audit_Backend_Structure','S05_Audit_Database_Design','S06_Audit_Process_Flow','S07_Audit_KPI_Flow'];

function createStepDir(stepDir, label, taskId) {
  mkdirSync(join(stepDir, 'Prompts'), { recursive: true });
  if (existsSync(PROMPTS_SRC)) {
    try {
      const files = readdirSync(PROMPTS_SRC);
      for (const f of files) copyFileSync(join(PROMPTS_SRC, f), join(stepDir, 'Prompts', f));
    } catch(e) {}
  }
  const stepStatus = 'step:\n  name: "' + label + '"\n  task: "' + taskId + '"\n  status: "PLANNING"\n  estimated_hours: 4\n  evidence_required:\n    - "' + label + ' implemented and verified"';
  writeFileSync(join(stepDir, 'STEP_STATUS.yaml'), stepStatus);

  // Copy 20 planning documents if available
  if (existsSync(STEP_DOCS)) {
    try {
      const docs = readdirSync(STEP_DOCS);
      for (const doc of docs) {
        if (!existsSync(join(stepDir, doc))) {
          copyFileSync(join(STEP_DOCS, doc), join(stepDir, doc));
        }
      }
    } catch(e) {}
  }
}

let totalPhases = 0;
let totalTasks = 0;

for (const wave of waves) {
  const waveDir = join(WAVES_ROOT, wave.name);
  mkdirSync(waveDir, { recursive: true });

  // Wave Vision
  const waveContent = '# ' + wave.name.replace(/_/g, ' ') + '\n\n**Vision:** ' + wave.vision + '\n**Status:** PLANNING\n\n## Phases\n';
  writeFileSync(join(waveDir, 'WAVE_VISION.md'), waveContent);

  for (const phase of wave.phases) {
    const phaseDir = join(waveDir, 'Phases', phase.name);
    mkdirSync(join(phaseDir, 'Tasks'), { recursive: true });
    totalPhases++;

    // Phase Status YAML
    let phaseYaml = 'phase:\n  name: "' + phase.name.replace(/_/g, ' ') + '"\n  wave: "' + wave.name.replace('Wave_0', '').charAt(0) + '"\n  status: "PLANNING"\n  tasks:\n';

    for (const task of phase.tasks) {
      const taskDir = join(phaseDir, 'Tasks', task);
      mkdirSync(taskDir, { recursive: true });
      totalTasks++;
      const taskLabel = task.replace(/T\d+_/g, '').replace(/_/g, ' ');

      // Task Status
      const taskContent = 'task:\n  name: "' + taskLabel + '"\n  phase: "' + phase.name + '"\n  status: "PLANNING"\n  steps:\n    S01: "Implement ' + taskLabel + '"\n  completion_criteria:\n    - "Task complete with evidence"';
      writeFileSync(join(taskDir, 'TASK_STATUS.yaml'), taskContent);

      // Step
      const stepDir = join(taskDir, 'Steps', 'S01_Implement');
      mkdirSync(stepDir, { recursive: true });
      createStepDir(stepDir, 'Implement ' + taskLabel, task);

      phaseYaml += '    ' + task + ':\n      name: "' + taskLabel + '"\n      status: "PLANNING"\n      steps:\n        S01: "Implement ' + taskLabel + '"\n';
    }

    // T99 Phase Audit
    const t99Dir = join(phaseDir, 'Tasks', 'T99_Phase_Audit');
    mkdirSync(join(t99Dir, 'Steps'), { recursive: true });
    const t99Content = 'task:\n  name: "Phase Completion Audit"\n  phase: "' + phase.name + '"\n  status: "PLANNING"\n  priority: "CRITICAL"\n  steps:\n';
    let t99Steps = '';
    for (const s of T99_STEPS) {
      const label = s.replace(/S\d+_/g, '').replace(/_/g, ' ');
      t99Steps += '    ' + s + ': "' + label + '"\n';
      const sDir = join(t99Dir, 'Steps', s);
      mkdirSync(sDir, { recursive: true });
      createStepDir(sDir, label, 'T99');
    }
    writeFileSync(join(t99Dir, 'TASK_STATUS.yaml'), t99Content + t99Steps + '  completion_criteria:\n    - "All 7 audit steps plus verification loop pass"');

    phaseYaml += '    T99_Phase_Audit:\n      name: "Phase Completion Audit"\n      status: "PLANNING"\n      steps:\n';
    for (const s of T99_STEPS) {
      const label = s.replace(/S\d+_/g, '').replace(/_/g, ' ');
      phaseYaml += '        ' + s + ': "' + label + '"\n';
    }
    writeFileSync(join(phaseDir, 'PHASE_STATUS.yaml'), phaseYaml);
  }
}

console.log('Waves 02-06 generated: ' + waves.length + ' waves, ' + totalPhases + ' phases, ' + totalTasks + ' tasks');
