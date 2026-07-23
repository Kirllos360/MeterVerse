import { mkdirSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const base = 'D:/meter/planning/001_WAVES/Wave_01_Enterprise_Hardening/Phases/Phase_420_Shared_Auth_Permissions';
const promptSrc = 'D:/meter/planning/900_TEMPLATES/PROMPTS';

const tasks = {
  'T00_Shared_Login_Engine': {
    desc: 'Build shared login engine for admin and user portals',
    steps: ['S01_Design_Login_Protocol','S02_Build_Core_Auth','S03_Add_Scoped_Tokens','S04_Wire_UI_Redirects','S05_Add_Login_Theming']
  },
  'T00_Enforce_Permissions': {
    desc: 'Enforce requirePermission on all 140+ endpoints',
    steps: ['S01_Map_Endpoints','S02_Replace_Role_Gates','S03_Add_Permission_Middleware','S04_Seed_Permission_Keys']
  },
  'T99_Phase_Audit': {
    desc: 'Phase Completion Audit',
    steps: ['S01_Audit_Planning_Docs','S02_Audit_Graph_Architecture','S03_Audit_Frontend_Structure','S04_Audit_Backend_Structure','S05_Audit_Database_Design','S06_Audit_Process_Flow','S07_Audit_KPI_Flow','S00_Verification_Loop']
  }
};

for (const [taskName, taskInfo] of Object.entries(tasks)) {
  const taskDir = join(base, 'Tasks', taskName);
  mkdirSync(join(taskDir, 'Steps'), { recursive: true });

  const lines = [
    'task:',
    '  name: "' + taskInfo.desc + '"',
    '  phase: "420"',
    '  status: "PLANNING"',
    '  priority: "CRITICAL"',
    '  steps:'
  ];

  for (const step of taskInfo.steps) {
    const label = step.replace(/S\d+_/g, '').replace(/_/g, ' ');
    lines.push('    ' + step + ': "' + label + '"');
    const stepDir = join(taskDir, 'Steps', step);
    mkdirSync(join(stepDir, 'Prompts'), { recursive: true });

    if (existsSync(promptSrc)) {
      const files = readdirSync(promptSrc);
      for (const f of files) {
        copyFileSync(join(promptSrc, f), join(stepDir, 'Prompts', f));
      }
    }

    const stepContent = 'step:\n  name: "' + label + '"\n  status: "PLANNING"\n  priority: "CRITICAL"\n  estimated_hours: 4\n  evidence_required:\n    - "Step completed and verified"';
    writeFileSync(join(stepDir, 'STEP_STATUS.yaml'), stepContent);
  }

  lines.push('  completion_criteria:');
  lines.push('    - "All steps complete with evidence"');
  writeFileSync(join(taskDir, 'TASK_STATUS.yaml'), lines.join('\r\n'));
  console.log('  Created: ' + taskName + ' (' + taskInfo.steps.length + ' steps)');
}

// Update Wave README
const waveReadme = 'D:/meter/planning/001_WAVES/Wave_01_Enterprise_Hardening/README.md';
let readme = require('fs').readFileSync(waveReadme, 'utf8');
if (readme.indexOf('Phase 42.0') === -1) {
  readme = readme.replace('6 sub-phases', '7 sub-phases');
  readme = readme.replace('| 42f | Communication and Billing |', '| 42.0 | Shared Auth & Permissions | PLANNING | T00 (Login), T00 (Permissions) |\n| 42f | Communication and Billing |');
  readme = readme.replace('42f (Communication & Billing)', '42.0 (Shared Auth)');
  readme = readme.replace('42a depends on nothing', '42.0 depends on nothing — MUST BE FIRST');
  require('fs').writeFileSync(waveReadme, readme);
  console.log('  Updated Wave README');
}

console.log('\nPhase 42.0 complete: ' + Object.keys(tasks).length + ' tasks');
